import type { Limit } from '@wpm-discord-bot/shared-types/Number';
import type { BotGotTimedOutOnGuilds } from '@prisma/client';

import verrou, { VERROU_HANDLE_TEMP_BANS_JOB_LOCK_KEYS } from '#@/config/verrou';
import toUTC from '@wpm-discord-bot/shared-lib/portable/date/toUTC';
import traceError from '#@/helpers/interactions/traceError';
import { BATCH_SIZE } from '#@/jobs/handleToOnBot';
import prisma from '#@/db/prisma';

async function attemptToPullTimeoutsOnBotBatchFromDB(batchSize: Limit = BATCH_SIZE): Promise<BotGotTimedOutOnGuilds[]> {
  let batch: BotGotTimedOutOnGuilds[] = [];

  try {
    await verrou
      .use('redis')
      .createLock(VERROU_HANDLE_TEMP_BANS_JOB_LOCK_KEYS.ATTEMPT_TO_PULL_TIMEOUTS_ON_BOT_BATCH_FROM_DB, '1m')
      .runImmediately(async () => {
        try {
          const todayUTC = toUTC(new Date());

          const timeoutsOnBot: BotGotTimedOutOnGuilds[] = await prisma.botGotTimedOutOnGuilds.findMany({
            where: {
              until: {
                lt: todayUTC
              }
            },

            orderBy: {
              until: 'asc'
            },

            take: batchSize
          });

          batch = timeoutsOnBot;
        } catch (error) {
          traceError(error);
        }
      });
  } catch {}

  return batch;
}

export default attemptToPullTimeoutsOnBotBatchFromDB;
