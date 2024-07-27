import type { MsValue } from '@wpm-discord-bot/shared-types/Number';
import type { GuildMember } from 'discord.js';

import {
  attemptToTurnOffIsAbandonerFlagWithUnauthorizedToManageBansBotClient,
  attemptToTurnOffIsAbandonerFlagWithAuthorizedToManageBansBotClient,
  attemptToTurnOnIsAbandonerFlag
} from '#@/db/dsl/guilds/isAbandonerFlagTweakers';
import lazilyFetchGuildWithAutowiredClient from '#@/lib/discordjs/lazilyFetchGuildWithAutowiredClient';
import lazilyFetchGuildMember from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchGuildMember';
import { SimpleIntervalJob, ToadScheduler, Task } from 'toad-scheduler';
import wait from '@wpm-discord-bot/shared-lib/portable/promise/wait';
import toUTC from '@wpm-discord-bot/shared-lib/portable/date/toUTC';
import traceError from '#@/helpers/interactions/traceError';
import { getDiscordBotId } from '#@/client';

import attemptToMoveTempBannedMembersToTempBannedMembersMissingPerms from './helpers/tempBans/db/attemptToMoveTempBannedMembersToTempBannedMembersMissingPerms';
import { getGlobalRateLimitCounterLockedState, attemptToIncrementGlobalLockCounter } from './helpers/rateLimit/facades/throttling/globalLock';
import attemptToPullTimeoutsOnBotBatchFromDB from './helpers/timeoutOnBot/db/attemptToPullTimeoutsOnBotBatchFromDB';
import attemptToDeleteTimeoutOnBot from './helpers/timeoutOnBot/db/attemptToDeleteTimeoutOnBot';
import attemptToUpsertTimeoutOnBot from './helpers/timeoutOnBot/db/attemptToUpsertTimeoutOnBot';
import { EIncrementCounterResult, EIsLockedCounter } from './helpers/rateLimit/enums';
import timeQuantumGenerator from './helpers/common/timeQuantumGenerator';
import { JOBS_MAX_GLOBAL_REQ_PER_SECOND } from './constants/limits';
import { jobsIds } from './constants/ids';

export const BATCH_SIZE = JOBS_MAX_GLOBAL_REQ_PER_SECOND;
const TASK_INTERVAL = 1e3 as const satisfies MsValue;

namespace TimeoutOnBotHandler {
  const task = new Task(jobsIds.TimeoutOnBotHandler, async () => {
    const timeQuantum = timeQuantumGenerator();
    await wait(timeQuantum);

    const globalRateLimitReached = (await getGlobalRateLimitCounterLockedState()) === EIsLockedCounter.LOCKED;
    if (globalRateLimitReached) return;

    const batch = await attemptToPullTimeoutsOnBotBatchFromDB(BATCH_SIZE);

    if (batch.length <= 0) return;

    try {
      const discordBotId = await getDiscordBotId();

      async function taskLoop() {
        for (const { until: untilUTC, discordGuildId } of batch) {
          const guildId = String(discordGuildId);

          const authorizedByThrottlerToProcessUnbanAccordingToGlobalRateLimit =
            (await attemptToIncrementGlobalLockCounter({ job: jobsIds.TimeoutOnBotHandler, guildId })) === EIncrementCounterResult.INCREMENTED;

          if (!authorizedByThrottlerToProcessUnbanAccordingToGlobalRateLimit) break;

          const guild = await lazilyFetchGuildWithAutowiredClient(guildId);

          if (guild === null) {
            const g = guildId;
            await Promise.all([attemptToDeleteTimeoutOnBot(g), attemptToTurnOnIsAbandonerFlag(g, { awaitGC: true })]);

            return;
          }

          const botMember = (await lazilyFetchGuildMember(guild, discordBotId)) as GuildMember;
          const currentUntil = botMember.communicationDisabledUntil;

          if (currentUntil === null || untilUTC >= toUTC(currentUntil)) {
            await attemptToDeleteTimeoutOnBot(guildId);

            if (botMember.permissions.has('BanMembers')) {
              await attemptToTurnOffIsAbandonerFlagWithAuthorizedToManageBansBotClient(guild);
            } else {
              await attemptToTurnOffIsAbandonerFlagWithUnauthorizedToManageBansBotClient(guildId);
            }

            return;
          }

          await attemptToUpsertTimeoutOnBot(guildId, currentUntil);
          await attemptToMoveTempBannedMembersToTempBannedMembersMissingPerms(guild.id);
        }
      }

      await taskLoop();
    } catch (error) {
      traceError(error);
    }
  });

  export const scheduler = new ToadScheduler();
  export const job = new SimpleIntervalJob({ milliseconds: TASK_INTERVAL }, task);
}

export function startTimeoutOnBotHandler() {
  TimeoutOnBotHandler.scheduler.addSimpleIntervalJob(TimeoutOnBotHandler.job);
}
