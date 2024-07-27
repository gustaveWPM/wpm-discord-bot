import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';

import attemptToReplyToInteraction from '@wpm-discord-bot/shared-lib/discordjs/attemptToReplyToInteraction';
import buildMagicUserId from '@wpm-discord-bot/shared-lib/portable/string/buildMagicUserId';
import { ECanModerateThisUser } from '@wpm-discord-bot/shared-specs/ECanModerateThisUser';
import { pickRandomMeme } from '#@/easterEggs/commands/moderation/youtubeMemes';
import { attemptToGetLanguageGuildSide } from '#𝕃/getLanguagePipelines';
import { vocabAccessor } from '#𝕃/vocabAccessor';

import { getKickInteractionOptions } from '../getInteractionOptions';

export const cannotKickThisMemberMatchingEffects = {
  [ECanModerateThisUser.BotHasNotThePermissionsToModerateTargetMember]: async (i) => {
    const [targetMember] = getKickInteractionOptions(i, '');

    const { guildId, guild } = i;
    const { name: guildName } = guild;

    attemptToReplyToInteraction(i, {
      content: vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).errors.kickCallback.followUpFeedback.botIsMissingPermissions({
        memberIdMagicString: buildMagicUserId(targetMember.id),
        guildName
      }),

      ephemeral: true
    });
  },

  [ECanModerateThisUser.FailedToInteract]: async (i) => {
    const [targetMember] = getKickInteractionOptions(i, '');

    const { guildId, guild } = i;
    const { name: guildName } = guild;

    attemptToReplyToInteraction(i, {
      content: vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).errors.kickCallback.followUpFeedback.failedToInteract({
        memberIdMagicString: buildMagicUserId(targetMember.id),
        guildName
      }),

      ephemeral: true
    });
  },

  [ECanModerateThisUser.TryingToModerateTheBot]: async (i) => {
    const { guildId } = i;

    const locale = await attemptToGetLanguageGuildSide(guildId);

    attemptToReplyToInteraction(i, {
      content: vocabAccessor(locale).errors.kickCallback.followUpFeedback.triedToKickBot({
        youtubeMemeLink: pickRandomMeme(locale)
      }),

      ephemeral: true
    });
  },

  [ECanModerateThisUser.CallerMemberHasNotThePermissionsToModerateTargetMember]: async (i) => {
    const { guildId } = i;

    attemptToReplyToInteraction(i, {
      content: vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).errors.kickCallback.followUpFeedback.youCantKickThisMember(),
      ephemeral: true
    });
  },

  [ECanModerateThisUser.TryingToSelfModerate]: async (i) => {
    const { guildId } = i;

    attemptToReplyToInteraction(i, {
      content: vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).errors.kickCallback.followUpFeedback.triedToKickYourself(),
      ephemeral: true
    });
  },

  [ECanModerateThisUser.UserNotInGuild]: async (i) => {
    const { guildId } = i;

    attemptToReplyToInteraction(i, {
      content: vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).vocab.userNotInGuild(),
      ephemeral: true
    });
  }
} as const satisfies Record<Exclude<ECanModerateThisUser, ECanModerateThisUser.OK>, (interaction: GuildInteraction) => Promise<void>>;
