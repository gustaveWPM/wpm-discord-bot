import type { Guild } from 'discord.js';

import { REDIS_HANDLE_TEMP_BANS_JOB, redisClient } from '#@/config/redis';
import { Command } from 'ioredis';

async function getCacheKeys(): Promise<Array<Guild['id']>> {
  const objKeysCommand = new Command('JSON.OBJKEYS', [REDIS_HANDLE_TEMP_BANS_JOB.CACHE, '$']);
  const objKeys = ((await redisClient.sendCommand(objKeysCommand)) as unknown[][]).flat() as Buffer[] | [null];

  if (objKeys.length === 1 && objKeys[0] === null) return [];

  const mountedObjKeys = (objKeys as Buffer[]).map((buffer) => buffer.toString());
  return mountedObjKeys;
}

export default getCacheKeys;
