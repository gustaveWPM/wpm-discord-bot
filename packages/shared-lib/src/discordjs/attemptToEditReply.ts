import type { ChatInputCommandInteraction, InteractionReplyOptions } from 'discord.js';
import type { AttemptToResultCtx } from '@wpm-discord-bot/shared-types/Utils';

async function attemptToEditReply(interaction: ChatInputCommandInteraction, options: InteractionReplyOptions): Promise<AttemptToResultCtx> {
  try {
    await interaction.editReply(options);
    return {};
  } catch (error) {
    return { failureCtx: error };
  }
}

export default attemptToEditReply;
