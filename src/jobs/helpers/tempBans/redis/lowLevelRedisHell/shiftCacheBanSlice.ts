import type { Guild } from 'discord.js';

import { REDIS_HANDLE_TEMP_BANS_JOB, redisClient } from '#@/config/redis';
import { Command } from 'ioredis';

async function shiftCacheBanSlice(guildId: Guild['id']) {
  const shiftCommand = new Command('JSON.ARRPOP', [REDIS_HANDLE_TEMP_BANS_JOB.CACHE, `$.${guildId}`, 0]);
  await redisClient.sendCommand(shiftCommand);
}

export default shiftCacheBanSlice;
