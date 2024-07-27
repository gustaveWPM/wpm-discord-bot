import type { ChannelWithTextChat } from '@wpm-discord-bot/shared-types/Channels';
import type { Channel } from 'discord.js';

import { CHANNELS_WITH_TEXT_CHAT } from '@wpm-discord-bot/shared-specs/Discord';

const isChannelWithTextChat = (channel: Channel): channel is ChannelWithTextChat => CHANNELS_WITH_TEXT_CHAT.some((t) => channel.type === t);

export default isChannelWithTextChat;
