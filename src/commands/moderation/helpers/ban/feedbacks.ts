import type { FailedToInteractModerationCommandEphemeralFn, GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { IncorrectTimeString } from '@wpm-discord-bot/shared-types/String';
import type { Guild, User } from 'discord.js';

import attemptToReplyToInteraction from '@wpm-discord-bot/shared-lib/discordjs/attemptToReplyToInteraction';
import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import buildMagicUserId from '@wpm-discord-bot/shared-lib/portable/string/buildMagicUserId';
import durationValueHelpEmbed from '#@/components/static/help/durationValueHelpEmbed';
import { attemptToGetLanguageDmSideOrGuildSide } from '#𝕃/getLanguagePipelines';
import { vocabAccessor } from '#𝕃/vocabAccessor';

const { EMOJIS } = BOT_APP_HARD_CODED_STATIC_CONTEXT.VISUAL_CHART;

export async function attemptToSendIncorrectDeleteHistoryDurationLimitInputEphemeral(
  interaction: GuildInteraction,
  targetMemberId: User['id'],
  guildName: Guild['name'],
  userDurationInput: IncorrectTimeString
) {
  const { guildId, user } = interaction;
  const { id: userId } = user;

  const locale = await attemptToGetLanguageDmSideOrGuildSide({
    guildId,
    userId
  });

  const embed = durationValueHelpEmbed({
    additionalInformations:
      vocabAccessor(locale).tutorials.usage.durationOption.examples.banDeleteMessagesHistoryDurationLimit.additionalInformations(),
    examples: vocabAccessor(locale).tutorials.usage.durationOption.examples.banDeleteMessagesHistoryDurationLimit.gist(),
    option: vocabAccessor(locale).slashCommands.ban.options['delete-messages'].name(),
    commandName: vocabAccessor(locale).slashCommands.ban.name(),
    userDurationInput,
    locale
  });

  const yourBanHasNotBeenApplied =
    `## ${EMOJIS.WARNING} ` +
    vocabAccessor(locale).errors.banCallback.followUpFeedback.misusages.warnings.yourBanHasNotBeenApplied({
      userIdMagicString: buildMagicUserId(targetMemberId),
      guildName
    });

  const youHaveMisusedAnOption = '## ' + vocabAccessor(locale).errors.commons.youHaveMisusedAnOption();

  const content = [yourBanHasNotBeenApplied, youHaveMisusedAnOption].join('\n');

  attemptToReplyToInteraction(interaction, {
    embeds: [embed],
    ephemeral: true,
    content
  });
}

export async function attemptToSendIncorrectBanTimeInputEphemeral(
  interaction: GuildInteraction,
  targetMemberId: User['id'],
  guildName: Guild['name'],
  userDurationInput: IncorrectTimeString
) {
  const { guildId, user } = interaction;
  const { id: userId } = user;

  const locale = await attemptToGetLanguageDmSideOrGuildSide({
    guildId,
    userId
  });

  const embed = durationValueHelpEmbed({
    additionalInformations: vocabAccessor(locale).tutorials.usage.durationOption.examples.ban.additionalInformations(),
    examples: vocabAccessor(locale).tutorials.usage.durationOption.examples.ban.gist(),
    option: vocabAccessor(locale).slashCommands.ban.options.duration.name(),
    commandName: vocabAccessor(locale).slashCommands.ban.name(),
    userDurationInput,
    locale
  });

  const yourBanHasNotBeenApplied =
    `## ${EMOJIS.WARNING} ` +
    vocabAccessor(locale).errors.banCallback.followUpFeedback.misusages.warnings.yourBanHasNotBeenApplied({
      userIdMagicString: buildMagicUserId(targetMemberId),
      guildName
    });

  const youHaveMisusedAnOption = '## ' + vocabAccessor(locale).errors.commons.youHaveMisusedAnOption();

  const content = [yourBanHasNotBeenApplied, youHaveMisusedAnOption].join('\n');

  attemptToReplyToInteraction(interaction, {
    embeds: [embed],
    ephemeral: true,
    content
  });
}

export const attemptToSendFailedToInteractEphemeral: FailedToInteractModerationCommandEphemeralFn = async ({
  targetMemberId,
  interaction,
  guildName
}) =>
  attemptToReplyToInteraction(interaction, {
    content: vocabAccessor(
      await attemptToGetLanguageDmSideOrGuildSide({
        guildId: interaction.guildId,
        userId: interaction.user.id
      })
    ).errors.banCallback.followUpFeedback.failedToInteract({
      userIdMagicString: buildMagicUserId(targetMemberId),
      guildName
    }),

    ephemeral: true
  });
