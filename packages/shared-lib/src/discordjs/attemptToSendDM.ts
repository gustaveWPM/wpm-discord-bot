import type { SendMessageToTextChannelOptions } from '@wpm-discord-bot/shared-types/Channels';
import type { AttemptToResultCtx } from '@wpm-discord-bot/shared-types/Utils';
import type { GuildMember, Message, User } from 'discord.js';

async function attemptToSendDM(targetMember: GuildMember | User, options: SendMessageToTextChannelOptions): Promise<AttemptToSendDMResultCtx> {
  try {
    const success = await targetMember.send(options);
    return { successCtx: success };
  } catch (error) {
    return { failureCtx: error };
  }
}

export default attemptToSendDM;

export type AttemptToSendDMResultCtx = Partial<{ successCtx: Message } & AttemptToResultCtx>;
