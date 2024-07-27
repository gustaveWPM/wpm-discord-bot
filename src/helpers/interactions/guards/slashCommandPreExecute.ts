import type { HasPassedAllGuards, GuardsPermissions } from '@wpm-discord-bot/shared-types/Interaction';
import type { MaybeEmptyErrorsDetectionFeedback } from '@wpm-discord-bot/shared-types/String';
import type { ChatInputCommandInteraction } from 'discord.js';

import attemptToReplyToInteraction from '@wpm-discord-bot/shared-lib/discordjs/attemptToReplyToInteraction';
import foldFeedbacks from '@wpm-discord-bot/shared-lib/portable/string/foldFeedbacks';

import isPremiumGuard from './functions/isPremium';
import { EMPTY_FEEDBACK } from './consts';

async function slashCommandPreExecute(interaction: ChatInputCommandInteraction, guardsPermissions: GuardsPermissions): Promise<HasPassedAllGuards> {
  const { isPremium } = guardsPermissions;

  const allFeedbacks: MaybeEmptyErrorsDetectionFeedback[] = await Promise.all([isPremiumGuard(isPremium, interaction)]);

  const foldedFeedbacks: MaybeEmptyErrorsDetectionFeedback = foldFeedbacks(...allFeedbacks);
  if (foldedFeedbacks === EMPTY_FEEDBACK) return true;

  attemptToReplyToInteraction(interaction, { content: foldedFeedbacks, ephemeral: true });
  return false;
}

export default slashCommandPreExecute;
