import type { ReadyExtendedClient, ClientExtensions, ExtendedClient } from '@wpm-discord-bot/shared-types/BotClient';
import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { ClientOptions, User } from 'discord.js';

import { registerGlobalCommandsOnline, registerGuildCommandsOnline, buildInitializedClient } from '#@/helpers/ini/client';
import { loadAllLocalesAsync } from '#𝕃/typesafe-i18n/i18n-util.async';
import { vocabAccessor } from '#𝕃/vocabAccessor';

import { serializedGlobalCommands, serializedGuildCommands } from './commands/all';
import { CLIENT_EXTENSIONS_INITIAL_STATE, PARTIALS, INTENTS } from './config/ini';
import bentocache, { DISCORD_BOT_ID_KEY } from './config/bentocache';
import appEnv from './env/appEnv';

const { DEV_GUILD_ID: guildId, BOT_TOKEN: botToken, CLIENT_ID: clientId, BOT_TOKEN } = appEnv;

namespace Ctx {
  export let maybeReadyClient: MaybeNull<ReadyExtendedClient> = null;
}

async function loadAllVocab(options: Options = {}) {
  await loadAllLocalesAsync();
  if (options.log) console.log(vocabAccessor().initializers.loadedVocab());
}

function mountClient(
  partials: ClientOptions['partials'],
  intents: ClientOptions['intents'],
  clientExtensionsInitialState: ClientExtensions,
  options: Options = {}
): ExtendedClient {
  const client = buildInitializedClient(partials, intents, clientExtensionsInitialState);
  if (options.log) console.log(vocabAccessor().initializers.mountedClient());
  return client;
}

/**
 * @throws {DiscordAPIError}
 * CASCADE
 */
export async function registerCommandsOnDiscordSide(options: Options = {}) {
  await Promise.all([
    registerGuildCommandsOnline(serializedGuildCommands, { botToken, clientId, guildId }),
    registerGlobalCommandsOnline(serializedGlobalCommands, { botToken, clientId })
  ]);
  if (options.log) console.log(vocabAccessor().initializers.registeredCommandsOnline());
}

async function initializeClient(options: Options = {}): Promise<ReadyExtendedClient> {
  await loadAllVocab(options);
  await registerCommandsOnDiscordSide(options);

  const mountedClient = mountClient(PARTIALS, INTENTS, CLIENT_EXTENSIONS_INITIAL_STATE, options);

  await mountedClient.login(BOT_TOKEN);
  return mountedClient as ReadyExtendedClient;
}

async function getOrInitializeClient(options: Options = {}): Promise<ReadyExtendedClient> {
  if (Ctx.maybeReadyClient !== null) return Ctx.maybeReadyClient;

  Ctx.maybeReadyClient = await initializeClient(options);

  return Ctx.maybeReadyClient;
}

export const getGlobalClient = async () => await getOrInitializeClient();

export const getDiscordBotId = async (): Promise<User['id']> =>
  await bentocache.use('multitier').getOrSetForever(DISCORD_BOT_ID_KEY, async () => (await getGlobalClient()).user.id);

// NOTE: just a tiny alias to avoid confusion in main.ts
export const login = async (options: Options = {}): Promise<void> => {
  await getOrInitializeClient(options);
};

type Options = Partial<{ log: boolean }>;
