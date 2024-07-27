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

export async function attemptToSendIncorrectMuteTimeInputEphemeral(
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
    additionalInformations: vocabAccessor(locale).tutorials.usage.durationOption.examples.mute.additionalInformations(),
    examples: vocabAccessor(locale).tutorials.usage.durationOption.examples.mute.gist(),
    option: vocabAccessor(locale).slashCommands.mute.options.duration.name(),
    commandName: vocabAccessor(locale).slashCommands.mute.name(),
    userDurationInput,
    locale
  });

  const yourMuteHasNotBeenApplied =
    `## ${EMOJIS.WARNING} ` +
    vocabAccessor(locale).errors.muteCallback.followUpFeedback.misusages.warnings.yourMuteHasNotBeenApplied({
      memberIdMagicString: buildMagicUserId(targetMemberId),
      guildName
    });

  const youHaveMisusedAnOption = '## ' + vocabAccessor(locale).errors.commons.youHaveMisusedAnOption();

  const content = [yourMuteHasNotBeenApplied, youHaveMisusedAnOption].join('\n');

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
    ).errors.muteCallback.followUpFeedback.failedToInteract({
      memberIdMagicString: buildMagicUserId(targetMemberId),
      guildName
    }),

    ephemeral: true
  });
