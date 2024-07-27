import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';

import { REDIS_HANDLE_TEMP_BANS_JOB, redisClient } from '#@/config/redis';
import { Command } from 'ioredis';

async function prepareCache() {
  const path = '.';

  async function affectCache() {
    const setCommand = new Command('JSON.SET', [REDIS_HANDLE_TEMP_BANS_JOB.CACHE, path, '{}']);
    await redisClient.sendCommand(setCommand);
  }

  const c = new Command('JSON.GET', [REDIS_HANDLE_TEMP_BANS_JOB.CACHE, path]);
  const maybeBuffer = (await redisClient.sendCommand(c)) as MaybeNull<Buffer>;
  if (maybeBuffer === null) await affectCache();
}

export default prepareCache;
