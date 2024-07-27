import type { AttemptToSendDMResultCtx } from '@wpm-discord-bot/shared-lib/discordjs/attemptToSendDM';
import type { TempBannedMembers, DefBannedMembers } from '@wpm-discord-bot/shared-types/Database';
import type { TimestampInMs, Quantity, MsValue } from '@wpm-discord-bot/shared-types/Number';
import type { MaybeUndefined, MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { PermissionLabel } from '@wpm-discord-bot/shared-types/SlashCommand';
import type { ChatInputCommandInteraction, GuildMember, User } from 'discord.js';
import type { ModerationReason } from '@wpm-discord-bot/shared-types/String';

import buildModerationCommandTraceAdditionalInformations from '@wpm-discord-bot/shared-lib/portable/trace/builders/functions/buildModerationCommandTraceAdditionalInformations';
import getUntilDateUtcAndDiscordMagicTimestampAndMagicCountdown from '@wpm-discord-bot/shared-lib/portable/date/getUntilDateUtcAndDiscordMagicTimestampAndMagicCountdown';
import buildGuildInteractionFromGuildMemberToAnotherGuildMember from '@wpm-discord-bot/shared-lib/discordjs/buildGuildInteractionFromGuildMemberToAnotherGuildMember';
import lazilyFetchChannelFromGuildInteractionInChannel from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchChannelFromGuildInteractionInChannel';
import getUserOrGuildMemberFromSlashCommandUserOption from '@wpm-discord-bot/shared-lib/discordjs/getUserOrGuildMemberFromSlashCommandUserOption';
import attemptToParseDurationSlashCommandOption from '@wpm-discord-bot/shared-lib/lukeed-ms/attemptToParseDurationSlashCommandOption';
import { attemptToTurnOffIsAbandonerFlagWithAuthorizedToManageBansBotClient } from '#@/db/dsl/guilds/isAbandonerFlagTweakers';
import attemptToDeleteInteractionReply from '@wpm-discord-bot/shared-lib/discordjs/attemptToDeleteInteractionReply';
import { attemptToGetLanguageGuildSideOrDmSide, attemptToGetLanguageGuildSide } from '#𝕃/getLanguagePipelines';
import attemptToSendMessageInChannel from '@wpm-discord-bot/shared-lib/discordjs/attemptToSendMessageInChannel';
import attemptToReplyToInteraction from '@wpm-discord-bot/shared-lib/discordjs/attemptToReplyToInteraction';
import tryToCheckIfIsAlreadyBanned from '@wpm-discord-bot/shared-lib/discordjs/tryToCheckIfIsAlreadyBanned';
import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import { isGuildInteractionInChannel } from '@wpm-discord-bot/shared-lib/discordjs/isGuildInteraction';
import attemptToDeleteMessage from '@wpm-discord-bot/shared-lib/discordjs/attemptToDeleteMessage';
import canModerateThisMember from '@wpm-discord-bot/shared-lib/discordjs/canModerateThisMember';
import { ECanModerateThisUser } from '@wpm-discord-bot/shared-specs/ECanModerateThisUser';
import bannedMemberEmbed from '#@/components/static/moderation/ban/bannedMemberEmbed';
import attemptToSendDM from '@wpm-discord-bot/shared-lib/discordjs/attemptToSendDM';
import { EParseTime } from '@wpm-discord-bot/shared-specs/EParseTime';
import verrou, { verrouKeysFactory } from '#@/config/verrou';
import traceError from '#@/helpers/interactions/traceError';
import { vocabAccessor } from '#𝕃/vocabAccessor';

import {
  attemptToSendIncorrectDeleteHistoryDurationLimitInputEphemeral,
  attemptToSendIncorrectBanTimeInputEphemeral,
  attemptToSendFailedToInteractEphemeral
} from './helpers/ban/feedbacks';
import { attemptToDeleteDbEntry as attemptToDeleteTempBanDbEntry, insertTempBanInDB } from './helpers/ban/dbCalls/tempBan';
import { attemptToDeleteDbEntry as attemptToDeleteDefBanDbEntry, insertDefBanInDB } from './helpers/ban/dbCalls/defBan';
import { cannotBanThisMemberMatchingEffects } from './helpers/ban/errors/cannotBanThisMemberMatchingEffects';
import { shortenModerationReasonMsg } from './helpers/common/prefixAndShortenModerationReasonMsg';
import { getBanInteractionOptions } from './helpers/ban/getInteractionOptions';
import { countPastBansAmount } from './helpers/ban/dbCalls/archive';
import { EBanMisusages } from './helpers/ban/enums';

const isDefBanDbEntry = (
  dbEntry: TempBannedMembers | DefBannedMembers,
  parsedTime: MsValue,
  __isDefBan = parsedTime < 0
): dbEntry is DefBannedMembers => __isDefBan;

function rescue({
  narrowedTargetMember,
  parsedDurationTime,
  interaction,
  dbEntry,
  error
}: {
  dbEntry: MaybeNull<TempBannedMembers | DefBannedMembers>;
  narrowedTargetMember: GuildMember | User;
  interaction: GuildInteraction;
  parsedDurationTime: MsValue;
  error: unknown;
}) {
  traceError(error, buildModerationCommandTraceAdditionalInformations(interaction, narrowedTargetMember));

  const { guild } = interaction;
  const { name: guildName } = guild;

  attemptToSendFailedToInteractEphemeral({ targetMemberId: narrowedTargetMember.id, interaction, guildName });

  if (dbEntry === null) return;

  if (isDefBanDbEntry(dbEntry, parsedDurationTime)) {
    attemptToDeleteDefBanDbEntry(dbEntry);
  } else {
    attemptToDeleteTempBanDbEntry(dbEntry);
  }
}

/**
 * @throws {PrismaClientKnownRequestError}
 * CASCADE
 */
async function pushDB({
  narrowedTargetMemberId,
  discordMagicTimestamp,
  callerMember,
  interaction,
  bansAmount,
  untilUTC,
  isDefBan,
  reason
}: {
  narrowedTargetMemberId: GuildMember['id'] | User['id'];
  discordMagicTimestamp: TimestampInMs;
  interaction: GuildInteraction;
  callerMember: GuildMember;
  reason: ModerationReason;
  bansAmount: Quantity;
  isDefBan: boolean;
  untilUTC: Date;
}): Promise<MaybeNull<TempBannedMembers | DefBannedMembers>> {
  const { guildId } = interaction;

  if (isDefBan) {
    if (bansAmount > BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.MODERATION.SANCTIONS.MAX_BANS_PER_USER_AMOUNT) return null;

    return await insertDefBanInDB({
      targetMemberId: narrowedTargetMemberId,
      callerMemberId: callerMember.id,
      guildId,
      reason
    });
  }

  return await insertTempBanInDB({
    discordMagicTimestamp: BigInt(discordMagicTimestamp),
    targetMemberId: narrowedTargetMemberId,
    callerMemberId: callerMember.id,
    untilUTC,
    guildId,
    reason
  });
}

export async function banCommandCallback(justChatInteraction: ChatInputCommandInteraction) {
  const { guildInteraction: interaction, callerMember } = buildGuildInteractionFromGuildMemberToAnotherGuildMember(justChatInteraction);

  if (interaction === undefined || callerMember === undefined) {
    const { guildId, user } = justChatInteraction;
    const { id: userId } = user;

    attemptToReplyToInteraction(justChatInteraction, {
      content: vocabAccessor(
        await attemptToGetLanguageGuildSideOrDmSide({
          guildId,
          userId
        })
      ).vocab.failedToInteract(),

      ephemeral: true
    });

    return;
  }

  const { guildId, guild } = interaction;

  const reasonNotSpecified = vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).vocab.reasonNotSpecified();
  const [duration, commandTargetUser, reason, deleteHistoryDurationLimit] = getBanInteractionOptions(interaction, reasonNotSpecified);
  const narrowedTargetMember = await getUserOrGuildMemberFromSlashCommandUserOption(interaction, commandTargetUser);

  const p = ['BanMembers'] as const satisfies PermissionLabel[];

  const moderableMember = await canModerateThisMember(
    interaction,
    narrowedTargetMember.id,
    {
      requiredUserPermissions: p,
      requiredBotPermissions: p
    },
    { skipUserNotInGuild: true }
  );

  if (moderableMember.resStatus !== ECanModerateThisUser.OK && moderableMember.resStatus !== ECanModerateThisUser.UserNotInGuild) {
    if (moderableMember.failureCtx !== undefined) {
      traceError(moderableMember.failureCtx, buildModerationCommandTraceAdditionalInformations(interaction, narrowedTargetMember));
    }

    cannotBanThisMemberMatchingEffects[moderableMember.resStatus](interaction);
    return;
  }

  try {
    if (await tryToCheckIfIsAlreadyBanned(guild, narrowedTargetMember)) {
      cannotBanThisMemberMatchingEffects[EBanMisusages.AlreadyBannedMember](interaction);
      return;
    }
  } catch (error) {
    rescue({ parsedDurationTime: -1, narrowedTargetMember, dbEntry: null, interaction, error });
  }

  const { resStatus: parseDurationResStatus, value: parsedDurationTime } =
    duration === null
      ? { resStatus: EParseTime.OK, value: -1 }
      : attemptToParseDurationSlashCommandOption(duration, BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.MODERATION.SANCTIONS.BAN_LIMITS_IN_MS);

  const { resStatus: parseDeleteHistoryDurationLimitResStatus, value: parsedDeleteHistoryTime } =
    deleteHistoryDurationLimit === null
      ? { resStatus: EParseTime.OK, value: -1 }
      : attemptToParseDurationSlashCommandOption(
          deleteHistoryDurationLimit,
          BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.MODERATION.SANCTIONS.BAN_DELETE_HISTORY_LIMITS_IN_MS
        );

  if (duration !== null && parseDurationResStatus === EParseTime.IncorrectInput) {
    attemptToSendIncorrectBanTimeInputEphemeral(interaction, narrowedTargetMember.id, guild.name, duration);
    return;
  }

  if (deleteHistoryDurationLimit !== null && parseDeleteHistoryDurationLimitResStatus === EParseTime.IncorrectInput) {
    attemptToSendIncorrectDeleteHistoryDurationLimitInputEphemeral(interaction, narrowedTargetMember.id, guild.name, deleteHistoryDurationLimit);

    return;
  }

  const isDefBan = parsedDurationTime < 0;

  const [untilUTC, discordMagicTimestamp, magicCountdown] = getUntilDateUtcAndDiscordMagicTimestampAndMagicCountdown(parsedDurationTime);

  await interaction.deferReply({ ephemeral: true });

  await attemptToTurnOffIsAbandonerFlagWithAuthorizedToManageBansBotClient(guild, { awaitGC: true });

  let dbEntry: MaybeNull<TempBannedMembers | DefBannedMembers> = null;

  try {
    let bansAmount = await countPastBansAmount({ memberId: narrowedTargetMember.id, guildId });

    dbEntry = await pushDB({
      narrowedTargetMemberId: narrowedTargetMember.id,
      discordMagicTimestamp,
      callerMember,
      interaction,
      bansAmount,
      isDefBan,
      untilUTC,
      reason
    });

    bansAmount += 1;

    const embed = await bannedMemberEmbed({
      countdownMagicString: parsedDurationTime >= 0 ? magicCountdown : undefined,
      bannedUser: narrowedTargetMember,
      interaction,
      bansAmount,
      reason
    });

    const embeds = { embeds: [embed] };

    try {
      await verrou
        .use('redis')
        .createLock(verrouKeysFactory.processingBanOnUserViaTheBot(guildId, narrowedTargetMember.id), '10s')
        .run(async () => {
          let dm: MaybeUndefined<AttemptToSendDMResultCtx>;
          try {
            const deleteMessageSeconds =
              deleteHistoryDurationLimit === null
                ? undefined
                : Math.max(
                    BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.MODERATION.SANCTIONS.BAN_DELETE_HISTORY_LIMITS_IN_SECONDS.MIN,

                    Math.min(
                      Math.ceil(parsedDeleteHistoryTime / 1e3),

                      BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.MODERATION.SANCTIONS.BAN_DELETE_HISTORY_LIMITS_IN_SECONDS.MAX
                    )
                  );

            dm = await attemptToSendDM(narrowedTargetMember, embeds);
            await guild.bans.create(narrowedTargetMember.id, {
              reason: reason === reasonNotSpecified ? undefined : shortenModerationReasonMsg(reason, 'BannedMembers'),
              deleteMessageSeconds
            });
          } catch (error) {
            if (dm?.successCtx !== undefined) attemptToDeleteMessage(dm.successCtx);
            throw error;
          }

          attemptToDeleteInteractionReply(interaction);

          if (!isGuildInteractionInChannel(interaction)) return;

          const channel = await lazilyFetchChannelFromGuildInteractionInChannel(interaction);
          attemptToSendMessageInChannel(channel, embeds);
        });
    } catch (error) {
      rescue({ narrowedTargetMember, parsedDurationTime, interaction, dbEntry, error });
    }
  } catch (error) {
    rescue({ narrowedTargetMember, parsedDurationTime, interaction, dbEntry, error });
  }
}
