import type { Client } from 'discord.js';

import type { SlashCommands } from './SlashCommand';

export type ClientExtensions = { commands: SlashCommands };
export type ExtendedClient = ClientExtensions & Client;
export type ReadyExtendedClient = ClientExtensions & ReadyClient;
export type ReadyClient = Client<true>;
