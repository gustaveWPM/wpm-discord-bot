import type { SendMessageToTextChannelOptions, ChannelWithTextChat } from '@wpm-discord-bot/shared-types/Channels';
import type { AttemptToResultCtx } from '@wpm-discord-bot/shared-types/Utils';
import type { Message } from 'discord.js';

async function attemptToSendMessageInChannel(
  targetChannel: ChannelWithTextChat,
  options: SendMessageToTextChannelOptions
): Promise<AttemptToSendMessageInChannelResultCtx> {
  try {
    const message = await targetChannel.send(options);
    return { successCtx: message };
  } catch (error) {
    return { failureCtx: error };
  }
}

export default attemptToSendMessageInChannel;

type AttemptToSendMessageInChannelResultCtx = Partial<{ successCtx: Message } & AttemptToResultCtx>;
