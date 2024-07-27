import type { AttemptToResultCtx } from '@wpm-discord-bot/shared-types/Utils';
import type { Message } from 'discord.js';

async function attemptToDeleteMessage(message: Message): Promise<AttemptToResultCtx> {
  try {
    await message.delete();
    return {};
  } catch (error) {
    return { failureCtx: error };
  }
}

export default attemptToDeleteMessage;
