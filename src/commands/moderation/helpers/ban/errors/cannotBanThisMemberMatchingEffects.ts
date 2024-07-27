import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';

import attemptToMoveTempBannedMembersToTempBannedMembersMissingPerms from '#@/jobs/helpers/tempBans/db/attemptToMoveTempBannedMembersToTempBannedMembersMissingPerms';
import attemptToReplyToInteraction from '@wpm-discord-bot/shared-lib/discordjs/attemptToReplyToInteraction';
import lazilyFetchGuildMember from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchGuildMember';
import buildMagicUserId from '@wpm-discord-bot/shared-lib/portable/string/buildMagicUserId';
import { attemptToTurnOnIsAbandonerFlag } from '#@/db/dsl/guilds/isAbandonerFlagTweakers';
import { ECanModerateThisUser } from '@wpm-discord-bot/shared-specs/ECanModerateThisUser';
import { pickRandomMeme } from '#@/easterEggs/commands/moderation/youtubeMemes';
import { attemptToGetLanguageGuildSide } from '#𝕃/getLanguagePipelines';
import { vocabAccessor } from '#𝕃/vocabAccessor';

import { getBanInteractionOptions } from '../getInteractionOptions';
import { EBanMisusages } from '../enums';

export const cannotBanThisMemberMatchingEffects = {
  [ECanModerateThisUser.BotHasNotThePermissionsToModerateTargetMember]: async (i) => {
    const [, commandTargetUser] = getBanInteractionOptions(i, '');

    const { guildId, client, guild } = i;
    const { name: guildName } = guild;

    async function attemptToLoadTempBannedMembersIntoTempBannedMembersMissingPermsEntries() {
      const discordBotId = client.user.id;
      const botMember = await lazilyFetchGuildMember(guild, discordBotId);

      if (botMember === null) {
        attemptToTurnOnIsAbandonerFlag(guildId);
        return;
      }

      if (!botMember.permissions.has('BanMembers')) {
        attemptToMoveTempBannedMembersToTempBannedMembersMissingPerms(guildId);
      }
    }

    attemptToLoadTempBannedMembersIntoTempBannedMembersMissingPermsEntries();

    attemptToReplyToInteraction(i, {
      content: vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).errors.banCallback.followUpFeedback.botIsMissingPermissions({
        userIdMagicString: buildMagicUserId(commandTargetUser.id),
        guildName
      }),

      ephemeral: true
    });
  },

  [EBanMisusages.AlreadyBannedMember]: async (i) => {
    const [, commandTargetUser] = getBanInteractionOptions(i, '');

    const { guildId, guild } = i;
    const { name: guildName } = guild;

    attemptToReplyToInteraction(i, {
      content: vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).errors.banCallback.followUpFeedback.thisUserIsAlreadyBanned({
        userIdMagicString: buildMagicUserId(commandTargetUser.id),
        guildName
      }),

      ephemeral: true
    });
  },

  [ECanModerateThisUser.FailedToInteract]: async (i) => {
    const [, commandTargetUser] = getBanInteractionOptions(i, '');

    const { guildId, guild } = i;
    const { name: guildName } = guild;

    attemptToReplyToInteraction(i, {
      content: vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).errors.banCallback.followUpFeedback.failedToInteract({
        userIdMagicString: buildMagicUserId(commandTargetUser.id),
        guildName
      }),

      ephemeral: true
    });
  },

  [ECanModerateThisUser.TryingToModerateTheBot]: async (i) => {
    const { guildId } = i;

    const locale = await attemptToGetLanguageGuildSide(guildId);

    attemptToReplyToInteraction(i, {
      content: vocabAccessor(locale).errors.banCallback.followUpFeedback.triedToBanBot({
        youtubeMemeLink: pickRandomMeme(locale)
      }),

      ephemeral: true
    });
  },

  [ECanModerateThisUser.CallerMemberHasNotThePermissionsToModerateTargetMember]: async (i) => {
    const { guildId } = i;

    attemptToReplyToInteraction(i, {
      content: vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).errors.banCallback.followUpFeedback.youCantBanThisUser(),
      ephemeral: true
    });
  },

  [ECanModerateThisUser.TryingToSelfModerate]: async (i) => {
    const { guildId } = i;

    attemptToReplyToInteraction(i, {
      content: vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).errors.banCallback.followUpFeedback.triedToBanYourself(),
      ephemeral: true
    });
  }
} as const satisfies Record<Exclude<BaseKeys, ExcludedKeys>, (interaction: GuildInteraction) => Promise<void>>;

type BaseKeys = ECanModerateThisUser | EBanMisusages;
type ExcludedKeys = ECanModerateThisUser.UserNotInGuild | ECanModerateThisUser.OK;
