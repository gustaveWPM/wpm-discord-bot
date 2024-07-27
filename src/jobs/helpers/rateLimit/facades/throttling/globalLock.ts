import type { JsonObj } from '@wpm-discord-bot/shared-types/JSON';

import { JOBS_MAX_GLOBAL_REQ_PER_SECOND as maxValue } from '#@/jobs/constants/limits';
import { ONE_SECOND_TTL as ttl, REDIS_JOBS } from '#@/config/redis';

import { attemptToIncrementCounter, getCounterLockedState } from '../../internals/throttling';

export const getGlobalRateLimitCounterLockedState = (ctx: JsonObj = {}) =>
  getCounterLockedState(
    { counterKey: REDIS_JOBS.GLOBAL_RATE_LIMIT_THROTTLING, maxValue },
    { from: getGlobalRateLimitCounterLockedState.name, ...{ ctx } }
  );

export const attemptToIncrementGlobalLockCounter = (ctx: JsonObj = {}) =>
  attemptToIncrementCounter(
    { counterKey: REDIS_JOBS.GLOBAL_RATE_LIMIT_THROTTLING, maxValue, ttl },
    { from: attemptToIncrementGlobalLockCounter.name, ...{ ctx } }
  );
