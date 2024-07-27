import type { PermissionLabel } from '@wpm-discord-bot/shared-types/SlashCommand';
import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { MutedMembers } from '@prisma/client';

import buildModerationCommandTraceAdditionalInformations from '@wpm-discord-bot/shared-lib/portable/trace/builders/functions/buildModerationCommandTraceAdditionalInformations';
import getUntilDateUtcAndDiscordMagicTimestampAndMagicCountdown from '@wpm-discord-bot/shared-lib/portable/date/getUntilDateUtcAndDiscordMagicTimestampAndMagicCountdown';
import buildGuildInteractionFromGuildMemberToAnotherGuildMember from '@wpm-discord-bot/shared-lib/discordjs/buildGuildInteractionFromGuildMemberToAnotherGuildMember';
import lazilyFetchChannelFromGuildInteractionInChannel from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchChannelFromGuildInteractionInChannel';
import getUserOrGuildMemberFromSlashCommandUserOption from '@wpm-discord-bot/shared-lib/discordjs/getUserOrGuildMemberFromSlashCommandUserOption';
import attemptToParseDurationSlashCommandOption from '@wpm-discord-bot/shared-lib/lukeed-ms/attemptToParseDurationSlashCommandOption';
import attemptToDeleteInteractionReply from '@wpm-discord-bot/shared-lib/discordjs/attemptToDeleteInteractionReply';
import { attemptToGetLanguageGuildSideOrDmSide, attemptToGetLanguageGuildSide } from '#𝕃/getLanguagePipelines';
import attemptToSendMessageInChannel from '@wpm-discord-bot/shared-lib/discordjs/attemptToSendMessageInChannel';
import attemptToReplyToInteraction from '@wpm-discord-bot/shared-lib/discordjs/attemptToReplyToInteraction';
import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import { isGuildInteractionInChannel } from '@wpm-discord-bot/shared-lib/discordjs/isGuildInteraction';
import canModerateThisMember from '@wpm-discord-bot/shared-lib/discordjs/canModerateThisMember';
import { ECanModerateThisUser } from '@wpm-discord-bot/shared-specs/ECanModerateThisUser';
import mutedMemberEmbed from '#@/components/static/moderation/mute/mutedMemberEmbed';
import attemptToSendDM from '@wpm-discord-bot/shared-lib/discordjs/attemptToSendDM';
import { EParseTime } from '@wpm-discord-bot/shared-specs/EParseTime';
import traceError from '#@/helpers/interactions/traceError';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import { User } from 'discord.js';

import { attemptToSendIncorrectMuteTimeInputEphemeral, attemptToSendFailedToInteractEphemeral } from './helpers/mute/feedbacks';
import { cannotMuteThisMemberMatchingEffects } from './helpers/mute/errors/cannotMuteThisMemberMatchingEffects';
import { attemptToDeleteDbEntry, countPastMutesAmount, insertMuteInDB } from './helpers/mute/dbCalls';
import { getMuteInteractionOptions } from './helpers/mute/getInteractionOptions';
import isAlreadyMuted from './helpers/mute/validators/isAlreadyMuted';
import { EMuteMisusages } from './helpers/mute/enums';

export async function muteCommandCallback(justChatInteraction: ChatInputCommandInteraction) {
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
  const { name: guildName } = guild;

  const reasonNotSpecified = vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).vocab.reasonNotSpecified();
  const [duration, commandTargetUser, reason] = getMuteInteractionOptions(interaction, reasonNotSpecified);
  const narrowedTargetMember = await getUserOrGuildMemberFromSlashCommandUserOption(interaction, commandTargetUser);
  const userIsNotInTheGuild = narrowedTargetMember instanceof User;

  if (userIsNotInTheGuild) {
    cannotMuteThisMemberMatchingEffects[ECanModerateThisUser.UserNotInGuild](interaction);
    return;
  }

  const p = ['ModerateMembers'] as const satisfies PermissionLabel[];

  const moderableMember = await canModerateThisMember(interaction, narrowedTargetMember.id, {
    requiredUserPermissions: p,
    requiredBotPermissions: p
  });

  if (moderableMember.resStatus !== ECanModerateThisUser.OK) {
    if (moderableMember.failureCtx !== undefined) {
      traceError(moderableMember.failureCtx, buildModerationCommandTraceAdditionalInformations(interaction, narrowedTargetMember));
    }

    cannotMuteThisMemberMatchingEffects[moderableMember.resStatus](interaction);
    return;
  }

  if (isAlreadyMuted(narrowedTargetMember)) {
    cannotMuteThisMemberMatchingEffects[EMuteMisusages.AlreadyMutedMember](interaction);
    return;
  }

  const { resStatus: parseDurationResStatus, value: parsedTime } = attemptToParseDurationSlashCommandOption(
    duration,
    BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.MODERATION.SANCTIONS.TIMEOUT_LIMITS_IN_MS
  );

  if (parseDurationResStatus === EParseTime.IncorrectInput) {
    attemptToSendIncorrectMuteTimeInputEphemeral(interaction, narrowedTargetMember.id, guildName, duration);
    return;
  }

  const [untilUTC, discordMagicTimestamp, magicCountdown] = getUntilDateUtcAndDiscordMagicTimestampAndMagicCountdown(parsedTime);

  await interaction.deferReply({ ephemeral: true });

  let dbEntry: MaybeNull<MutedMembers> = null;

  try {
    let mutesAmount = await countPastMutesAmount({ memberId: narrowedTargetMember.id, guildId });

    if (mutesAmount <= BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.MODERATION.SANCTIONS.MAX_MUTES_PER_MEMBER_AMOUNT) {
      dbEntry = await insertMuteInDB({
        discordMagicTimestamp: BigInt(discordMagicTimestamp),
        targetMemberId: narrowedTargetMember.id,
        callerMemberId: callerMember.id,
        untilUTC,
        guildId,
        reason
      });
      mutesAmount += 1;
    }

    const embed = await mutedMemberEmbed(interaction, narrowedTargetMember, mutesAmount, magicCountdown, reason);
    const embeds = { embeds: [embed] };

    await narrowedTargetMember.timeout(parsedTime, reason === reasonNotSpecified ? undefined : reason);

    // eslint-disable-next-line promise/catch-or-return
    Promise.all([attemptToSendDM(narrowedTargetMember, embeds), attemptToDeleteInteractionReply(interaction)]);

    if (!isGuildInteractionInChannel(interaction)) return;

    const channel = await lazilyFetchChannelFromGuildInteractionInChannel(interaction);

    attemptToSendMessageInChannel(channel, embeds);
  } catch (error) {
    traceError(error, buildModerationCommandTraceAdditionalInformations(interaction, narrowedTargetMember));

    attemptToSendFailedToInteractEphemeral({ targetMemberId: narrowedTargetMember.id, interaction, guildName });
    if (dbEntry !== null) attemptToDeleteDbEntry(dbEntry);
  }
}
