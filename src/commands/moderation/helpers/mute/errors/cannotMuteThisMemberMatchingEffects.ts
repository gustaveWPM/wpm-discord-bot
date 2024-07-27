import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';

import attemptToReplyToInteraction from '@wpm-discord-bot/shared-lib/discordjs/attemptToReplyToInteraction';
import buildMagicUserId from '@wpm-discord-bot/shared-lib/portable/string/buildMagicUserId';
import { ECanModerateThisUser } from '@wpm-discord-bot/shared-specs/ECanModerateThisUser';
import { pickRandomMeme } from '#@/easterEggs/commands/moderation/youtubeMemes';
import { attemptToGetLanguageGuildSide } from '#𝕃/getLanguagePipelines';
import { vocabAccessor } from '#𝕃/vocabAccessor';

import { getMuteInteractionOptions } from '../getInteractionOptions';
import { EMuteMisusages } from '../enums';

export const cannotMuteThisMemberMatchingEffects = {
  [ECanModerateThisUser.CallerMemberHasNotThePermissionsToModerateTargetMember]: async (i) => {
    const [, commandTargetUser] = getMuteInteractionOptions(i, '');

    const { guildId, guild } = i;
    const { name: guildName } = guild;

    attemptToReplyToInteraction(i, {
      content: vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).errors.muteCallback.followUpFeedback.youCantMuteThisMember({
        memberIdMagicString: buildMagicUserId(commandTargetUser.id),
        guildName
      }),

      ephemeral: true
    });
  },

  [ECanModerateThisUser.BotHasNotThePermissionsToModerateTargetMember]: async (i) => {
    const [, commandTargetUser] = getMuteInteractionOptions(i, '');

    const { guildId, guild } = i;
    const { name: guildName } = guild;

    attemptToReplyToInteraction(i, {
      content: vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).errors.muteCallback.followUpFeedback.botIsMissingPermissions({
        memberIdMagicString: buildMagicUserId(commandTargetUser.id),
        guildName
      }),

      ephemeral: true
    });
  },

  [EMuteMisusages.AlreadyMutedMember]: async (i) => {
    const [, commandTargetUser] = getMuteInteractionOptions(i, '');

    const { guildId, guild } = i;
    const { name: guildName } = guild;

    attemptToReplyToInteraction(i, {
      content: vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).errors.muteCallback.followUpFeedback.thisMemberIsAlreadyMuted({
        memberIdMagicString: buildMagicUserId(commandTargetUser.id),
        guildName
      }),

      ephemeral: true
    });
  },

  [ECanModerateThisUser.FailedToInteract]: async (i) => {
    const [, commandTargetUser] = getMuteInteractionOptions(i, '');

    const { guildId, guild } = i;
    const { name: guildName } = guild;

    attemptToReplyToInteraction(i, {
      content: vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).errors.muteCallback.followUpFeedback.failedToInteract({
        memberIdMagicString: buildMagicUserId(commandTargetUser.id),
        guildName
      }),

      ephemeral: true
    });
  },

  [ECanModerateThisUser.TryingToModerateTheBot]: async (i) => {
    const { guildId } = i;

    const locale = await attemptToGetLanguageGuildSide(guildId);

    attemptToReplyToInteraction(i, {
      content: vocabAccessor(locale).errors.muteCallback.followUpFeedback.triedToMuteBot({
        youtubeMemeLink: pickRandomMeme(locale)
      }),

      ephemeral: true
    });
  },

  [ECanModerateThisUser.TryingToSelfModerate]: async (i) => {
    const { guildId } = i;

    attemptToReplyToInteraction(i, {
      content: vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).errors.muteCallback.followUpFeedback.triedToMuteYourself(),
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
} as const satisfies Record<
  Exclude<ECanModerateThisUser | EMuteMisusages, ECanModerateThisUser.OK>,
  (interaction: GuildInteraction) => Promise<void>
>;
