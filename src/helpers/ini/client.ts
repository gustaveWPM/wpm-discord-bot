import type { RESTPostAPIChatInputApplicationCommandsJSONBody, APIApplicationCommand, ClientOptions } from 'discord.js';
import type { ClientExtensions, ExtendedClient } from '@wpm-discord-bot/shared-types/BotClient';
import type { GlobalSlashCommandID, GuildSlashCommandID } from '#@/types/SlashCommand';
import type { OneOrMany } from '@wpm-discord-bot/shared-types/Utils';
import type { AppEnv } from '#@/schemas/appEnv';

import { pushRegisteredGlobalCommand, pushRegisteredGuildCommand } from '#@/cache/runtime';
import guildPresenceUpdateCallback from '#@/events/guildPresenceUpdateCallback';
import guildMemberUpdateCallback from '#@/events/guildMemberUpdateCallback';
import guildRoleUpdateCallback from '#@/events/guildRoleUpdateCallback';
import guildBanRemoveCallback from '#@/events/guildBanRemoveCallback';
import guildMemberAddCallback from '#@/events/guildMemberAddCallback';
import slashCommandCallback from '#@/events/slashCommandCallback';
import readyClientCallback from '#@/events/readyClientCallback';
import guildCreateCallback from '#@/events/guildCreateCallback';
import guildDeleteCallback from '#@/events/guildDeleteCallback';
import guildBanAddCallback from '#@/events/guildBanAddCallback';
import { Client, Events, Routes, REST } from 'discord.js';
import commands from '#@/commands/all';
import cloneDeep from 'clone-deep';

const buildExtendedClient = (clientBase: Client, extensions: ClientExtensions): ExtendedClient =>
  Object.assign(cloneDeep(clientBase), cloneDeep(extensions));

function loadCommandsInMemory(client: ExtendedClient) {
  for (const command of commands) client.commands.set(command.data.name, command);
}

/**
 * @throws {DiscordAPIError}
 */
export async function registerGuildCommandsOnline(
  body: OneOrMany<RESTPostAPIChatInputApplicationCommandsJSONBody>,
  envFragment: {
    guildId: AppEnv['DEV_GUILD_ID'];
    botToken: AppEnv['BOT_TOKEN'];
    clientId: AppEnv['CLIENT_ID'];
  }
) {
  const { botToken, clientId, guildId } = envFragment;
  const rest = new REST().setToken(botToken);

  try {
    const data = (await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body })) as APIApplicationCommand[];
    for (const payload of data) {
      pushRegisteredGuildCommand(payload as { name: GuildSlashCommandID } & APIApplicationCommand);
    }
  } catch (discordAPIError) {
    throw discordAPIError;
  }
}

/**
 * @throws {DiscordAPIError}
 */
export async function registerGlobalCommandsOnline(
  body: OneOrMany<RESTPostAPIChatInputApplicationCommandsJSONBody>,
  envFragment: {
    botToken: AppEnv['BOT_TOKEN'];
    clientId: AppEnv['CLIENT_ID'];
  }
) {
  const { botToken, clientId } = envFragment;
  const rest = new REST().setToken(botToken);

  try {
    const data = (await rest.put(Routes.applicationCommands(clientId), { body })) as APIApplicationCommand[];
    for (const payload of data) {
      pushRegisteredGlobalCommand(payload as { name: GlobalSlashCommandID } & APIApplicationCommand);
    }
  } catch (discordAPIError) {
    throw discordAPIError;
  }
}

const appendGuildRoleUpdateEvent = (client: ExtendedClient) => client.on(Events.GuildRoleUpdate, guildRoleUpdateCallback);

const appendGuildMemberUpdateEvent = (client: ExtendedClient) => client.on(Events.GuildMemberUpdate, guildMemberUpdateCallback);

const appendGuildCreateEvent = (client: ExtendedClient) => client.on(Events.GuildCreate, guildCreateCallback);

const appendGuildDeleteEvent = (client: ExtendedClient) => client.on(Events.GuildDelete, guildDeleteCallback);

const appendClientReadyEvent = (client: ExtendedClient) => client.once(Events.ClientReady, readyClientCallback);

const appendSlashCommandEvent = (client: ExtendedClient) => client.on(Events.InteractionCreate, slashCommandCallback);

const appendGuildBanRemoveEvent = (client: ExtendedClient) => client.on(Events.GuildBanRemove, guildBanRemoveCallback);

const appendGuildBanAddEvent = (client: ExtendedClient) => client.on(Events.GuildBanAdd, guildBanAddCallback);

const appendGuildMemberAddEvent = (client: ExtendedClient) => client.on(Events.GuildMemberAdd, guildMemberAddCallback);

const appendPresenceUpdateEvent = (client: ExtendedClient) => client.on(Events.PresenceUpdate, guildPresenceUpdateCallback);

function appendEvents(client: ExtendedClient) {
  appendClientReadyEvent(client);

  appendGuildCreateEvent(client);
  appendGuildDeleteEvent(client);

  appendSlashCommandEvent(client);

  appendGuildMemberUpdateEvent(client);
  appendGuildRoleUpdateEvent(client);
  appendGuildBanRemoveEvent(client);
  appendGuildBanAddEvent(client);

  appendGuildMemberAddEvent(client);

  appendPresenceUpdateEvent(client);
}

export function buildInitializedClient(
  partials: ClientOptions['partials'],
  intents: ClientOptions['intents'],
  clientExtensionsInitialState: ClientExtensions
): ExtendedClient {
  const client = buildExtendedClient(
    new Client({
      partials,
      intents
    }),
    clientExtensionsInitialState
  );

  loadCommandsInMemory(client);
  appendEvents(client);

  return client;
}
