import type { SecondsValue, MsValue, Limit } from '@wpm-discord-bot/shared-types/Number';
import type { Guild } from 'discord.js';

import traceError from '#@/helpers/interactions/traceError';
import appEnv from '#@/env/appEnv';
import { Redis } from 'ioredis';

// NOTE: refer to the "auto-reconnect" section - https://ioredis.readthedocs.io/en/latest/README/#quick-start
const retryStrategy = (times: number) => {
  const max: MsValue = 2e3;
  const defaultTimeQuantum: MsValue = 50;
  const maxTimesValueBeforeJustFallbackingOnMax: Limit = 40; // NOTE: max / defaultTimeQuantum = maxTimesValueBeforeJustFallbackingOnMax

  const delay: MsValue = times < maxTimesValueBeforeJustFallbackingOnMax ? Math.min(times * defaultTimeQuantum, max) : max;
  return delay;
};

export const host = 'bot_app_redis';
export const port = Number(appEnv.BOT_APP_REDIS_PORT);

const redisClient = new Redis({ retryStrategy, port, host });

// NOTE: refer to the "Connection Events" section - https://ioredis.readthedocs.io/en/latest/README/#reconnect-on-error
redisClient.on('error', (err) => {
  if (process.env.NODE_ENV === 'test') return;
  traceError(err, { from: 'redis' });
});

export const REDIS_HANDLE_TEMP_BANS_JOB = {
  CACHE: 'jobs:handle-temp-bans:cache'
};

export const REDIS_JOBS = {
  GLOBAL_RATE_LIMIT_THROTTLING: 'jobs:global-rate-limit-throttling:counter'
};

export const redisKeysFactory = {
  handleTempBansThrottlingGuildId: (guildId: Guild['id']) => `job:handle-temp-bans:rate-limit-throttling:guildId:${guildId}`
};

export const ONE_MINUTE_TTL = 60 as const satisfies SecondsValue;
export const ONE_SECOND_TTL = 1 as const satisfies SecondsValue;

export { redisClient };
