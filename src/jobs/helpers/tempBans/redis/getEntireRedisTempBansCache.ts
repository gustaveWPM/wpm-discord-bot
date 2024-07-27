import type { PartitionnedTempBans } from '#@/jobs/types/handleTempBans';
import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';

import { REDIS_HANDLE_TEMP_BANS_JOB, redisClient } from '#@/config/redis';
import { Command } from 'ioredis';

/**
 * Avoid to use that if you can, it's an expensive operation.
 */
async function getEntireRedisTempBansCache(): Promise<MaybeNull<PartitionnedTempBans>> {
  const getWholeCacheBufferCommand = new Command('JSON.GET', [REDIS_HANDLE_TEMP_BANS_JOB.CACHE, '.']);

  const wholeCacheBuffer = (await redisClient.sendCommand(getWholeCacheBufferCommand)) as MaybeNull<Buffer>;

  if (wholeCacheBuffer === null) return null;

  const entireCache = JSON.parse(wholeCacheBuffer.toString());
  return entireCache as PartitionnedTempBans;
}

export default getEntireRedisTempBansCache;
