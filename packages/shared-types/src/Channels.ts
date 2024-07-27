import type { MessageCreateOptions, PartialDMChannel, MessagePayload, DMChannel, Channel, Message } from 'discord.js';

type InGuild = boolean;

type HasSendMessageToTextChannelMethod<C extends Channel> = C extends {
  send: (options: SendMessageToTextChannelOptions) => Promise<Message<InGuild>>;
}
  ? C
  : never;

type IsChannelWithTextChat = HasSendMessageToTextChannelMethod<Channel>;

export type ChannelWithTextChat = Extract<Channel, IsChannelWithTextChat>;

export type SendMessageToTextChannelOptions = MessageCreateOptions | MessagePayload | string;

export type NotDMChannel<C extends Channel> = Exclude<C, PartialDMChannel | DMChannel>;
