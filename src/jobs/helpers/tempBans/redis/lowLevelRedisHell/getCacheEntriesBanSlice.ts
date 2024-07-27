import type { BansSlice } from '#@/jobs/types/handleTempBans';
import type { Guild } from 'discord.js';

import { REDIS_HANDLE_TEMP_BANS_JOB, redisClient } from '#@/config/redis';
import { Command } from 'ioredis';

async function getCacheEntriesBanSlice(guildId: Guild['id']) {
  const sliceLenCommand = new Command('JSON.GET', [REDIS_HANDLE_TEMP_BANS_JOB.CACHE, `$.${guildId}`]);
  const banSliceBuffer = (await redisClient.sendCommand(sliceLenCommand)) as Buffer;

  const banSlice = (JSON.parse(banSliceBuffer.toString()) as unknown[][]).flat();
  return banSlice as BansSlice;
}

export default getCacheEntriesBanSlice;
