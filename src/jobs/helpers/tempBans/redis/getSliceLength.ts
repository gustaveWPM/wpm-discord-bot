import type { Quantity, Count } from '@wpm-discord-bot/shared-types/Number';
import type { Guild } from 'discord.js';

import { REDIS_HANDLE_TEMP_BANS_JOB, redisClient } from '#@/config/redis';
import { Command } from 'ioredis';

async function getSliceLength(guildId: Guild['id']): Promise<Count> {
  const sliceLenCommand = new Command('JSON.ARRLEN', [REDIS_HANDLE_TEMP_BANS_JOB.CACHE, `$.${guildId}`]);

  try {
    const len = (await redisClient.sendCommand(sliceLenCommand)) as [Quantity];
    return len[0];
  } catch {
    return 0;
  }
}

export default getSliceLength;
