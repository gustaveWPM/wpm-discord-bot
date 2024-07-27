import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { WarnedMembers } from '@prisma/client';

import buildModerationCommandTraceAdditionalInformations from '@wpm-discord-bot/shared-lib/portable/trace/builders/functions/buildModerationCommandTraceAdditionalInformations';
import buildGuildInteractionFromGuildMemberToAnotherGuildMember from '@wpm-discord-bot/shared-lib/discordjs/buildGuildInteractionFromGuildMemberToAnotherGuildMember';
import lazilyFetchChannelFromGuildInteractionInChannel from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchChannelFromGuildInteractionInChannel';
import getUserOrGuildMemberFromSlashCommandUserOption from '@wpm-discord-bot/shared-lib/discordjs/getUserOrGuildMemberFromSlashCommandUserOption';
import attemptToDeleteInteractionReply from '@wpm-discord-bot/shared-lib/discordjs/attemptToDeleteInteractionReply';
import attemptToSendMessageInChannel from '@wpm-discord-bot/shared-lib/discordjs/attemptToSendMessageInChannel';
import attemptToReplyToInteraction from '@wpm-discord-bot/shared-lib/discordjs/attemptToReplyToInteraction';
import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import { isGuildInteractionInChannel } from '@wpm-discord-bot/shared-lib/discordjs/isGuildInteraction';
import canModerateThisMember from '@wpm-discord-bot/shared-lib/discordjs/canModerateThisMember';
import { ECanModerateThisUser } from '@wpm-discord-bot/shared-specs/ECanModerateThisUser';
import warnedMemberEmbed from '#@/components/static/moderation/warn/warnedMemberEmbed';
import attemptToSendDM from '@wpm-discord-bot/shared-lib/discordjs/attemptToSendDM';
import { attemptToGetLanguageGuildSideOrDmSide } from '#𝕃/getLanguagePipelines';
import traceError from '#@/helpers/interactions/traceError';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import { User } from 'discord.js';

import { cannotWarnThisMemberMatchingEffects } from './helpers/warn/errors/cannotWarnThisMemberMatchingEffects';
import { attemptToDeleteDbEntry, countPastWarnsAmount, insertWarnInDB } from './helpers/warn/dbCalls';
import { attemptToSendWarnFailedToInteractEphemeral } from './helpers/warn/feedback';
import { getWarnInteractionOptions } from './helpers/warn/getInteractionOptions';

export async function warnCommandCallback(justChatInteraction: ChatInputCommandInteraction) {
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

  const [commandTargetUser, reason] = await getWarnInteractionOptions(interaction);
  const narrowedTargetMember = await getUserOrGuildMemberFromSlashCommandUserOption(interaction, commandTargetUser);
  const userIsNotInTheGuild = narrowedTargetMember instanceof User;

  if (userIsNotInTheGuild) {
    cannotWarnThisMemberMatchingEffects[ECanModerateThisUser.UserNotInGuild](interaction);
    return;
  }

  const moderableMember = await canModerateThisMember(interaction, narrowedTargetMember.id, {
    requiredUserPermissions: ['ModerateMembers'],
    requiredBotPermissions: []
  });

  if (moderableMember.resStatus !== ECanModerateThisUser.OK) {
    if (moderableMember.failureCtx !== undefined) {
      traceError(moderableMember.failureCtx, buildModerationCommandTraceAdditionalInformations(interaction, narrowedTargetMember));
    }

    cannotWarnThisMemberMatchingEffects[moderableMember.resStatus](interaction);
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  let dbEntry: MaybeNull<WarnedMembers> = null;

  try {
    let warnsAmount = await countPastWarnsAmount({ memberId: narrowedTargetMember.id, guildId });

    if (warnsAmount <= BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.MODERATION.SANCTIONS.MAX_WARNS_PER_MEMBER_AMOUNT) {
      dbEntry = await insertWarnInDB({
        targetMemberId: narrowedTargetMember.id,
        callerMemberId: callerMember.id,
        guildId,
        reason
      });

      warnsAmount += 1;
    }

    const embed = await warnedMemberEmbed(interaction, narrowedTargetMember, reason, warnsAmount);
    const embeds = { embeds: [embed] };

    // eslint-disable-next-line promise/catch-or-return
    Promise.all([attemptToSendDM(narrowedTargetMember, embeds), attemptToDeleteInteractionReply(interaction)]);

    if (!isGuildInteractionInChannel(interaction)) return;

    const channel = await lazilyFetchChannelFromGuildInteractionInChannel(interaction);

    attemptToSendMessageInChannel(channel, embeds);
  } catch (error) {
    traceError(error, buildModerationCommandTraceAdditionalInformations(interaction, narrowedTargetMember));

    const { name: guildName } = guild;

    attemptToSendWarnFailedToInteractEphemeral({
      targetMemberId: narrowedTargetMember.id,
      interaction,
      guildName
    });

    if (dbEntry !== null) attemptToDeleteDbEntry(dbEntry);
  }
}
