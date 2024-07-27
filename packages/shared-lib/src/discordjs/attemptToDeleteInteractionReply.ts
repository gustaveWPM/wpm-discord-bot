import type { AttemptToResultCtx } from '@wpm-discord-bot/shared-types/Utils';
import type { ChatInputCommandInteraction } from 'discord.js';

async function attemptToDeleteInteractionReply(interaction: ChatInputCommandInteraction): Promise<AttemptToResultCtx> {
  try {
    await interaction.deleteReply();
    return {};
  } catch (error) {
    return { failureCtx: error };
  }
}

export default attemptToDeleteInteractionReply;
