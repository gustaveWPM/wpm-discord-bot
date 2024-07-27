import type { ModerationReason } from '@wpm-discord-bot/shared-types/String';
import type { ChatInputCommandInteraction } from 'discord.js';

import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import { attemptToGetLanguageGuildSideOrDmSide } from '#𝕃/getLanguagePipelines';
import shorten from '@wpm-discord-bot/shared-lib/portable/string/shorten';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import capitalize from '#@/lib/str/capitalize';

export const prefixModerationReasonMsg = async (reason: ModerationReason, interaction: ChatInputCommandInteraction) => {
  const locale = await attemptToGetLanguageGuildSideOrDmSide({
    guildId: interaction.guildId,
    userId: interaction.user.id
  });

  return vocabAccessor(locale).etc.fragments.separatedWithDoubleColumns({ prefix: capitalize(vocabAccessor(locale).vocab.reason()), suffix: reason });
};

export const shortenModerationReasonMsg = (
  rawReason: ModerationReason,
  limit: keyof typeof BOT_APP_HARD_CODED_STATIC_CONTEXT.DB.VARCHAR_LENGTH_CONSTRAINTS.MODERATION
) => shorten(rawReason, BOT_APP_HARD_CODED_STATIC_CONTEXT.DB.VARCHAR_LENGTH_CONSTRAINTS.MODERATION[limit]['reason']);
