import type { AttemptToSendDMResultCtx } from '@wpm-discord-bot/shared-lib/discordjs/attemptToSendDM';
import type { MaybeUndefined, MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { PermissionLabel } from '@wpm-discord-bot/shared-types/SlashCommand';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { KickedMembers } from '@prisma/client';

import buildModerationCommandTraceAdditionalInformations from '@wpm-discord-bot/shared-lib/portable/trace/builders/functions/buildModerationCommandTraceAdditionalInformations';
import buildGuildInteractionFromGuildMemberToAnotherGuildMember from '@wpm-discord-bot/shared-lib/discordjs/buildGuildInteractionFromGuildMemberToAnotherGuildMember';
import lazilyFetchChannelFromGuildInteractionInChannel from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchChannelFromGuildInteractionInChannel';
import getUserOrGuildMemberFromSlashCommandUserOption from '@wpm-discord-bot/shared-lib/discordjs/getUserOrGuildMemberFromSlashCommandUserOption';
import attemptToDeleteInteractionReply from '@wpm-discord-bot/shared-lib/discordjs/attemptToDeleteInteractionReply';
import { attemptToGetLanguageGuildSideOrDmSide, attemptToGetLanguageGuildSide } from '#𝕃/getLanguagePipelines';
import attemptToSendMessageInChannel from '@wpm-discord-bot/shared-lib/discordjs/attemptToSendMessageInChannel';
import attemptToReplyToInteraction from '@wpm-discord-bot/shared-lib/discordjs/attemptToReplyToInteraction';
import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import { isGuildInteractionInChannel } from '@wpm-discord-bot/shared-lib/discordjs/isGuildInteraction';
import attemptToDeleteMessage from '@wpm-discord-bot/shared-lib/discordjs/attemptToDeleteMessage';
import canModerateThisMember from '@wpm-discord-bot/shared-lib/discordjs/canModerateThisMember';
import { ECanModerateThisUser } from '@wpm-discord-bot/shared-specs/ECanModerateThisUser';
import kickedMemberEmbed from '#@/components/static/moderation/kick/kickedMemberEmbed';
import attemptToSendDM from '@wpm-discord-bot/shared-lib/discordjs/attemptToSendDM';
import traceError from '#@/helpers/interactions/traceError';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import { User } from 'discord.js';

import { cannotKickThisMemberMatchingEffects } from './helpers/kick/errors/cannotKickThisMemberMatchingEffects';
import { attemptToDeleteDbEntry, countPastKicksAmount, insertKickInDB } from './helpers/kick/dbCalls';
import { attemptToSendKickFailedToInteractEphemeral } from './helpers/kick/dmFeedbacks';
import { getKickInteractionOptions } from './helpers/kick/getInteractionOptions';

export async function kickCommandCallback(justChatInteraction: ChatInputCommandInteraction) {
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
  const [commandTargetUser, reason] = getKickInteractionOptions(interaction, reasonNotSpecified);
  const narrowedTargetMember = await getUserOrGuildMemberFromSlashCommandUserOption(interaction, commandTargetUser);
  const userIsNotInTheGuild = narrowedTargetMember instanceof User;

  if (userIsNotInTheGuild) {
    cannotKickThisMemberMatchingEffects[ECanModerateThisUser.UserNotInGuild](interaction);
    return;
  }

  const p = ['KickMembers'] as const satisfies PermissionLabel[];

  const moderableMember = await canModerateThisMember(interaction, narrowedTargetMember.id, {
    requiredUserPermissions: p,
    requiredBotPermissions: p
  });

  if (moderableMember.resStatus !== ECanModerateThisUser.OK) {
    if (moderableMember.failureCtx !== undefined) {
      traceError(moderableMember.failureCtx, buildModerationCommandTraceAdditionalInformations(interaction, narrowedTargetMember));
    }

    cannotKickThisMemberMatchingEffects[moderableMember.resStatus](interaction);
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  let dbEntry: MaybeNull<KickedMembers> = null;

  try {
    let kicksAmount = await countPastKicksAmount({ memberId: narrowedTargetMember.id, guildId });

    if (kicksAmount <= BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.MODERATION.SANCTIONS.MAX_KICKS_PER_MEMBER_AMOUNT) {
      dbEntry = await insertKickInDB({
        targetMemberId: narrowedTargetMember.id,
        callerMemberId: callerMember.id,
        guildId,
        reason
      });
      kicksAmount += 1;
    }

    const embed = await kickedMemberEmbed(interaction, narrowedTargetMember, reason, kicksAmount);
    const embeds = { embeds: [embed] };

    let dm: MaybeUndefined<AttemptToSendDMResultCtx>;
    try {
      dm = await attemptToSendDM(narrowedTargetMember, embeds);
      await narrowedTargetMember.kick(reason === reasonNotSpecified ? undefined : reason);
    } catch (error) {
      if (dm?.successCtx !== undefined) attemptToDeleteMessage(dm.successCtx);
      throw error;
    }

    attemptToDeleteInteractionReply(interaction);

    if (!isGuildInteractionInChannel(interaction)) return;

    const channel = await lazilyFetchChannelFromGuildInteractionInChannel(interaction);

    attemptToSendMessageInChannel(channel, embeds);
  } catch (error) {
    traceError(error, buildModerationCommandTraceAdditionalInformations(interaction, narrowedTargetMember));

    attemptToSendKickFailedToInteractEphemeral({
      targetMemberId: narrowedTargetMember.id,
      interaction,
      guildName
    });
    if (dbEntry !== null) attemptToDeleteDbEntry(dbEntry);
  }
}
