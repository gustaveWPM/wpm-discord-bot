import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { Channel } from 'discord.js';

import attemptToReplyToInteraction from '@wpm-discord-bot/shared-lib/discordjs/attemptToReplyToInteraction';
import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import buildMagicChannelId from '@wpm-discord-bot/shared-lib/portable/string/buildMagicChannelId';
import { attemptToGetLanguageGuildSideOrDmSide } from '#𝕃/getLanguagePipelines';
import { vocabAccessor } from '#𝕃/vocabAccessor';

const { MAX_GREETS_PER_GUILD_WITH_PREMIUM } = BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.MEMBERS_ONBOARDING.GREET;

export const attemptToSendUsedAllYourGreetCreditsWithFreemiumPlanEphemeral = async (interaction: GuildInteraction) =>
  attemptToReplyToInteraction(interaction, {
    content: vocabAccessor(
      await attemptToGetLanguageGuildSideOrDmSide({
        guildId: interaction.guildId,
        userId: interaction.user.id
      })
    ).errors.greetCallback.followUpFeedback.usedAllYourGreetCreditsEphemeralWithFreemiumPlan({
      premiumMaxGreetsAmount: MAX_GREETS_PER_GUILD_WITH_PREMIUM
    }),

    ephemeral: true
  });

export const attemptToSendUsedAllYourGreetCreditsWithPremiumPlanEphemeral = async (interaction: GuildInteraction) =>
  attemptToReplyToInteraction(interaction, {
    content: vocabAccessor(
      await attemptToGetLanguageGuildSideOrDmSide({
        guildId: interaction.guildId,
        userId: interaction.user.id
      })
    ).errors.greetCallback.followUpFeedback.usedAllYourGreetCreditsEphemeralWithPremiumPlan({
      premiumMaxGreetsAmount: MAX_GREETS_PER_GUILD_WITH_PREMIUM
    }),

    ephemeral: true
  });

export const attemptToSendBotIsMissingPermissionsEphemeral = async (interaction: GuildInteraction, targetChannelId: Channel['id']) =>
  attemptToReplyToInteraction(interaction, {
    content: vocabAccessor(
      await attemptToGetLanguageGuildSideOrDmSide({
        guildId: interaction.guildId,
        userId: interaction.user.id
      })
    ).errors.greetCallback.followUpFeedback.botIsMissingPermissions({
      channelIdMagicString: buildMagicChannelId(targetChannelId)
    }),

    ephemeral: true
  });

export const attemptToSendGreetAddedEphemeral = async (interaction: GuildInteraction, targetChannelId: Channel['id']) =>
  attemptToReplyToInteraction(interaction, {
    content: vocabAccessor(
      await attemptToGetLanguageGuildSideOrDmSide({
        guildId: interaction.guildId,
        userId: interaction.user.id
      })
    ).infos.greetCallback.followUpFeedback.greetAdded({
      channelIdMagicString: buildMagicChannelId(targetChannelId)
    }),

    ephemeral: true
  });

export const attemptToSendGreetRemovedEphemeral = async (interaction: GuildInteraction, targetChannelId: Channel['id']) =>
  attemptToReplyToInteraction(interaction, {
    content: vocabAccessor(
      await attemptToGetLanguageGuildSideOrDmSide({
        guildId: interaction.guildId,
        userId: interaction.user.id
      })
    ).infos.greetCallback.followUpFeedback.greetRemoved({
      channelIdMagicString: buildMagicChannelId(targetChannelId)
    }),

    ephemeral: true
  });
