import type { ClientExtensions } from '@wpm-discord-bot/shared-types/BotClient';
import type { ClientOptions } from 'discord.js';

import { readonlyUniqueArray } from '@wpm-discord-bot/shared-lib/portable/array/unique';
import { GatewayIntentBits, Collection, Partials } from 'discord.js';

const __INTENTS = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildModeration,
  GatewayIntentBits.GuildPresences
] as const satisfies ClientOptions['intents'];

const __PARTIALS = [Partials.GuildMember, Partials.Message, Partials.Channel, Partials.User] as const satisfies ClientOptions['partials'];

export const INTENTS = readonlyUniqueArray(__INTENTS);
export const PARTIALS = readonlyUniqueArray(__PARTIALS);

export const CLIENT_EXTENSIONS_INITIAL_STATE = { commands: new Collection() } as const satisfies ClientExtensions;
