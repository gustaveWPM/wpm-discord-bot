import type { SecondsValue, Limit } from '@wpm-discord-bot/shared-types/Number';
import type { JsonObj } from '@wpm-discord-bot/shared-types/JSON';

import traceError from '#@/helpers/interactions/traceError';
import { redisClient } from '#@/config/redis';

import { EIncrementCounterResult, EIsLockedCounter } from '../enums';

export async function getCounterLockedState(
  { counterKey, maxValue }: { counterKey: string; maxValue: Limit },
  ctx: JsonObj = {}
): Promise<EIsLockedCounter> {
  try {
    const counter = await redisClient.get(counterKey);
    if (counter === null) return EIsLockedCounter.UNLOCKED;

    const currentValue = Number(counter);
    if (isNaN(currentValue)) {
      traceError('Throttling: currentValue is NaN', { from: getCounterLockedState.name, ctx });
      return EIsLockedCounter.UNEXPECTED_BEHAVIOR;
    }

    return currentValue < maxValue ? EIsLockedCounter.UNLOCKED : EIsLockedCounter.LOCKED;
  } catch (error) {
    traceError(error);
    return EIsLockedCounter.UNEXPECTED_BEHAVIOR;
  }
}

export async function attemptToIncrementCounter(
  { counterKey, maxValue, ttl }: { counterKey: string; ttl: SecondsValue; maxValue: Limit },
  ctx: JsonObj = {}
): Promise<EIncrementCounterResult> {
  try {
    const counter = await redisClient.get(counterKey);
    if (counter === null) await redisClient.set(counterKey, 0, 'EX', ttl);

    const currentCounter = await redisClient.get(counterKey);
    if (currentCounter === null) {
      traceError('Throttling: currentCounter is null', { from: attemptToIncrementCounter.name, ctx });
      return EIncrementCounterResult.UNEXPECTED_BEHAVIOR;
    }

    const currentValue = Number(currentCounter);
    if (isNaN(currentValue)) {
      traceError('Throttling: currentValue is NaN', { from: attemptToIncrementCounter.name, ctx });
      return EIncrementCounterResult.UNEXPECTED_BEHAVIOR;
    }

    if (currentValue < maxValue) {
      await redisClient.incr(counterKey);
      return EIncrementCounterResult.INCREMENTED;
    }

    return EIncrementCounterResult.FORBIDDEN;
  } catch (error) {
    traceError(error);
    return EIncrementCounterResult.UNEXPECTED_BEHAVIOR;
  }
}
