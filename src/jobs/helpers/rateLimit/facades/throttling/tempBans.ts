import type { JsonObj } from '@wpm-discord-bot/shared-types/JSON';
import type { Guild } from 'discord.js';

import { MAX_UNBANS_PER_MINUTE_AND_PER_GUILD as maxValue } from '#@/jobs/constants/limits';
import { ONE_MINUTE_TTL as ttl, redisKeysFactory } from '#@/config/redis';

import { attemptToIncrementCounter, getCounterLockedState } from '../../internals/throttling';

const f = redisKeysFactory.handleTempBansThrottlingGuildId;

export const getTempBanCounterLockedState = (guildId: Guild['id'], ctx: JsonObj = {}) =>
  getCounterLockedState({ counterKey: f(guildId), maxValue }, { from: getTempBanCounterLockedState.name, guildId, ...{ ctx } });

export const attemptToIncrementTempBanCounter = (guildId: Guild['id'], ctx: JsonObj = {}) =>
  attemptToIncrementCounter({ counterKey: f(guildId), maxValue, ttl }, { from: attemptToIncrementTempBanCounter.name, guildId, ...{ ctx } });
