import type { MsValue, Limit } from '@wpm-discord-bot/shared-types/Number';
import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { TempBannedMembers } from '@prisma/client';
import type { Guild } from 'discord.js';

import lazilyFetchGuildWithAutowiredClient from '#@/lib/discordjs/lazilyFetchGuildWithAutowiredClient';
import verrou, { VERROU_HANDLE_TEMP_BANS_JOB_LOCK_KEYS, verrouKeysFactory } from '#@/config/verrou';
import lazilyFetchGuildMember from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchGuildMember';
import botIsTimedOut from '@wpm-discord-bot/shared-lib/discordjs/botIsTimedout';
import shuffleArray from '@wpm-discord-bot/shared-lib/portable/array/shuffle';
import { MISSING_PERMISSIONS } from '@wpm-discord-bot/shared-specs/Discord';
import { SimpleIntervalJob, ToadScheduler, Task } from 'toad-scheduler';
import wait from '@wpm-discord-bot/shared-lib/portable/promise/wait';
import traceError from '#@/helpers/interactions/traceError';
import { DiscordAPIError } from 'discord.js';
import { getDiscordBotId } from '#@/client';

import type { PartitionnedTempBans } from './types/handleTempBans';

import { getGlobalRateLimitCounterLockedState, attemptToIncrementGlobalLockCounter } from './helpers/rateLimit/facades/throttling/globalLock';
import attemptToMoveTempBannedMemberToBannedMembersArchive from './helpers/tempBans/db/attemptToMoveTempBannedMemberToBannedMembersArchive';
import { handleTempBansJobUnhappyPathsMatchingEffects } from './helpers/tempBans/errors/handleTempBansJobUnhappyPathsMatchingEffects';
import { attemptToIncrementTempBanCounter, getTempBanCounterLockedState } from './helpers/rateLimit/facades/throttling/tempBans';
import getCacheEntriesBanSlice from './helpers/tempBans/redis/lowLevelRedisHell/getCacheEntriesBanSlice';
import getCacheElementsAmount from './helpers/tempBans/redis/lowLevelRedisHell/getCacheElementsAmount';
import attemptToUpsertTimeoutOnBot from './helpers/timeoutOnBot/db/attemptToUpsertTimeoutOnBot';
import allCachePartitionsAreLocked from './helpers/tempBans/redis/allCachePartitionsAreLocked';
import shiftCacheBanSlice from './helpers/tempBans/redis/lowLevelRedisHell/shiftCacheBanSlice';
import getEntireRedisTempBansCache from './helpers/tempBans/redis/getEntireRedisTempBansCache';
import attemptToPopulateCache from './helpers/tempBans/fromPgToRedis/attemptToPopulateCache';
import { EIncrementCounterResult, EIsLockedCounter } from './helpers/rateLimit/enums';
import getCacheKeys from './helpers/tempBans/redis/lowLevelRedisHell/getCacheKeys';
import cleanOrphansInCache from './helpers/tempBans/redis/cleanOrphansInCache';
import { EJobUnhappyPaths } from './helpers/tempBans/errors/EJobUnhappyPaths';
import timeQuantumGenerator from './helpers/common/timeQuantumGenerator';
import { JOBS_MAX_GLOBAL_REQ_PER_SECOND } from './constants/limits';
import prepareCache from './helpers/tempBans/redis/prepareCache';
import { jobsIds } from './constants/ids';

const STOCHASTIC_GUILD_UNBAN_SCHEDULER_TASK_INTERVAL = 1000 as const satisfies MsValue;

const MAX_UNBANS_PER_SECOND = JOBS_MAX_GLOBAL_REQ_PER_SECOND;
export const BATCH_SIZE: Limit = JOBS_MAX_GLOBAL_REQ_PER_SECOND * 60 * 2; // NOTE: Max req/m * 2

namespace StochasticGuildUnbanScheduler {
  async function prepareStochasticGuildUnbanScheduler() {
    await prepareCache();
    await cleanOrphansInCache();
  }

  async function getUnlockedGuildIds(guildIds: Array<Guild['id']>): Promise<Array<Guild['id']>> {
    const unlockedGuildIds: Array<Guild['id']> = [];
    for (const guildId of guildIds) {
      const isUnlocked = (await getTempBanCounterLockedState(guildId)) === EIsLockedCounter.UNLOCKED;
      if (isUnlocked) unlockedGuildIds.push(guildId);
    }

    return unlockedGuildIds;
  }

  const task = new Task(jobsIds.StochasticGuildUnbanScheduler, async () => {
    const timeQuantum = timeQuantumGenerator();
    await prepareStochasticGuildUnbanScheduler();

    const cacheKeys = await getCacheKeys();
    const guildIds = await getUnlockedGuildIds(cacheKeys);

    if (guildIds.length <= 0) return;

    await wait(timeQuantum);

    const globalRateLimitReached = (await getGlobalRateLimitCounterLockedState()) === EIsLockedCounter.LOCKED;
    if (globalRateLimitReached) return;

    try {
      const shuffledGuildIds = shuffleArray(guildIds);
      const guildsToProcess = shuffledGuildIds.slice(0, Math.min(MAX_UNBANS_PER_SECOND, shuffledGuildIds.length));

      const discordBotId = await getDiscordBotId();

      async function taskLoop() {
        for (const guildId of guildsToProcess) {
          const authorizedByThrottlerToProcessUnbanAccordingToGlobalRateLimit =
            (await attemptToIncrementGlobalLockCounter({ job: jobsIds.StochasticGuildUnbanScheduler, guildId })) ===
            EIncrementCounterResult.INCREMENTED;

          if (!authorizedByThrottlerToProcessUnbanAccordingToGlobalRateLimit) break;

          const bansSlice = await getCacheEntriesBanSlice(guildId);
          if (bansSlice.length <= 0) continue;

          const guild = await lazilyFetchGuildWithAutowiredClient(guildId);
          const ban = bansSlice[0] as TempBannedMembers;

          if (guild === null) {
            await handleTempBansJobUnhappyPathsMatchingEffects[EJobUnhappyPaths.UNKNOWN_GUILD](ban);
            continue;
          }

          const botMember = await lazilyFetchGuildMember(guild, discordBotId);

          try {
            const authorizedByThrottlerToProcessUnbanAccordingToThrottlingByGuildId =
              (await attemptToIncrementTempBanCounter(guildId)) === EIncrementCounterResult.INCREMENTED;
            if (!authorizedByThrottlerToProcessUnbanAccordingToThrottlingByGuildId) continue;

            if (botMember !== null && botIsTimedOut(botMember)) {
              attemptToUpsertTimeoutOnBot(guildId, botMember.communicationDisabledUntil);
              handleTempBansJobUnhappyPathsMatchingEffects[MISSING_PERMISSIONS](ban);
              continue;
            }

            if (botMember !== null && !botMember.permissions.has('BanMembers')) {
              handleTempBansJobUnhappyPathsMatchingEffects[MISSING_PERMISSIONS](ban);
              continue;
            }

            const tempBannedMemberDiscordGuildIdAsString = String(ban.discordUserId);
            const x = tempBannedMemberDiscordGuildIdAsString;

            await verrou
              .use('redis')
              .createLock(verrouKeysFactory.processingUnbanOnUserViaTheBot(guildId, x), '10s')
              .run(async () => {
                await (guild as Guild).members.unban(x);

                await Promise.all([attemptToMoveTempBannedMemberToBannedMembersArchive(ban.id, x), shiftCacheBanSlice(guildId)]);
              });
          } catch (error) {
            if (!(error instanceof DiscordAPIError)) {
              let cache: MaybeNull<PartitionnedTempBans> = null;

              try {
                cache = await getEntireRedisTempBansCache();
                const niceReport = JSON.stringify({ banWhichRaisedError: ban, cache });
                traceError(error, niceReport);
              } catch {
                console.error("Couldn't stringify the cache!");
                console.error({ banWhichRaisedError: ban, cache });
                traceError(error);
              }

              continue;
            }

            const errorCodeNb = Number(error.code);
            if (isNaN(errorCodeNb)) continue;

            if (errorCodeNb in handleTempBansJobUnhappyPathsMatchingEffects) {
              const k = errorCodeNb as keyof typeof handleTempBansJobUnhappyPathsMatchingEffects;
              await handleTempBansJobUnhappyPathsMatchingEffects[k](ban);
            }
          }
        }
      }

      await taskLoop();
    } catch (error) {
      traceError(error);
    }
  });

  export const scheduler = new ToadScheduler();
  export const job = new SimpleIntervalJob({ milliseconds: STOCHASTIC_GUILD_UNBAN_SCHEDULER_TASK_INTERVAL }, task);
}

namespace CacheTempBans {
  const TASK_INTERVAL = 5e3 as const satisfies MsValue;

  const task = new Task(jobsIds.CacheTempBans, async () => {
    try {
      await verrou
        .use('redis')
        .createLock(VERROU_HANDLE_TEMP_BANS_JOB_LOCK_KEYS.CACHE_TEMP_BANS, `${TASK_INTERVAL - 500}ms`)
        .runImmediately(async () => {
          try {
            await prepareCache();

            const cacheElementsAmount = await getCacheElementsAmount();
            if (cacheElementsAmount <= 0) await attemptToPopulateCache();
          } catch (error) {
            traceError(error);
          }
        });
    } catch {}
  });

  export const scheduler = new ToadScheduler();
  export const job = new SimpleIntervalJob({ milliseconds: TASK_INTERVAL }, task);
}

namespace TopUpTempBans {
  const shouldSkipTask = async () => {
    const guildIds = await getCacheKeys();
    let lockedGuildIdsCount = 0;

    for (const guildId of guildIds) {
      const isLocked = (await getTempBanCounterLockedState(guildId)) === EIsLockedCounter.LOCKED;
      if (isLocked) lockedGuildIdsCount += 1;
    }

    return lockedGuildIdsCount <= 0;
  };

  const TASK_INTERVAL = 5e3 as const satisfies MsValue;

  const task = new Task(jobsIds.TopUpTempBans, async () => {
    try {
      await verrou
        .use('redis')
        .createLock(VERROU_HANDLE_TEMP_BANS_JOB_LOCK_KEYS.TOP_UP_TEMP_BANS, `${TASK_INTERVAL - 500}ms`)
        .runImmediately(async () => {
          try {
            await prepareCache();

            if (await shouldSkipTask()) return;

            const cacheElementsAmount = await getCacheElementsAmount();

            if (cacheElementsAmount > 0 && (await allCachePartitionsAreLocked())) {
              const delta = BATCH_SIZE - cacheElementsAmount;
              if (delta > 0) await attemptToPopulateCache(delta, await getCacheKeys());
            }
          } catch (error) {
            traceError(error);
          }
        });
    } catch {}
  });

  export const scheduler = new ToadScheduler();
  export const job = new SimpleIntervalJob({ milliseconds: TASK_INTERVAL }, task);
}

export function startTempBansHandler() {
  CacheTempBans.scheduler.addSimpleIntervalJob(CacheTempBans.job);
  TopUpTempBans.scheduler.addSimpleIntervalJob(TopUpTempBans.job);
  StochasticGuildUnbanScheduler.scheduler.addSimpleIntervalJob(StochasticGuildUnbanScheduler.job);
}
