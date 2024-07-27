import type { ChatInputCommandInteraction, InteractionReplyOptions } from 'discord.js';
import type { AttemptToResultCtx } from '@wpm-discord-bot/shared-types/Utils';

async function attemptToReplyToInteraction(
  interaction: ChatInputCommandInteraction,
  options: InteractionReplyOptions
): Promise<AttemptToReplyToInteractionResultCtx> {
  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(options);
      return {};
    }
    await interaction.reply(options);
    return {};
  } catch (error) {
    return { failureCtx: error };
  }
}

export type AttemptToReplyToInteractionResultCtx = AttemptToResultCtx;

export default attemptToReplyToInteraction;
