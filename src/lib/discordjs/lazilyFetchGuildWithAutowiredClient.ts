import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { Guild } from 'discord.js';

import lazilyFetchGuild from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchGuild';
import { getGlobalClient } from '#@/client';

async function lazilyFetchGuildWithAutowiredClient(guildId: Guild['id']): Promise<MaybeNull<Guild>> {
  // {ToDo} Find a way to autowire the client when we'll be sharding
  const client = await getGlobalClient();

  const maybeGuild = await lazilyFetchGuild(guildId, client);
  return maybeGuild;
}

export default lazilyFetchGuildWithAutowiredClient;
