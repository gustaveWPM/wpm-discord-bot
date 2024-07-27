import type { MaybeUndefined, MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { ExtendedClient } from '@wpm-discord-bot/shared-types/BotClient';
import type { Guild } from 'discord.js';

async function attemptToFetchGuild(guildId: Guild['id'], client: ExtendedClient): Promise<MaybeNull<Guild>> {
  try {
    const guild: Guild = await client.guilds.fetch(guildId);
    return guild;
  } catch {}

  return null;
}

// eslint-disable-next-line require-await
async function lazilyFetchGuild(guildId: Guild['id'], client: ExtendedClient): Promise<MaybeNull<Guild>> {
  const maybeGuild: MaybeUndefined<Guild> = client.guilds.cache.get(guildId);

  if (maybeGuild !== undefined) return maybeGuild;
  return attemptToFetchGuild(guildId, client);
}

export default lazilyFetchGuild;
