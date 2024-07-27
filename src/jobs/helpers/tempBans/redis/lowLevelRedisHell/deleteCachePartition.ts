import type { Guild } from 'discord.js';

import { REDIS_HANDLE_TEMP_BANS_JOB, redisKeysFactory, redisClient } from '#@/config/redis';
import { Command } from 'ioredis';

async function deleteCachePartition(guildId: Guild['id']) {
  const counterKey = redisKeysFactory.handleTempBansThrottlingGuildId(guildId);
  const deleteCommand = new Command('JSON.DEL', [REDIS_HANDLE_TEMP_BANS_JOB.CACHE, `$.${guildId}`]);

  await Promise.all([redisClient.del(counterKey), redisClient.sendCommand(deleteCommand)]);
}

export default deleteCachePartition;
