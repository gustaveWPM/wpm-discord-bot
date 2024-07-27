import type { Limit } from '@wpm-discord-bot/shared-types/Number';
import type { TempBannedMembers } from '@prisma/client';
import type { Guild } from 'discord.js';

import verrou, { VERROU_HANDLE_TEMP_BANS_JOB_LOCK_KEYS } from '#@/config/verrou';
import { MAX_UNBANS_PER_MINUTE_AND_PER_GUILD } from '#@/jobs/constants/limits';
import toUTC from '@wpm-discord-bot/shared-lib/portable/date/toUTC';
import traceError from '#@/helpers/interactions/traceError';
import prisma from '#@/db/prisma';

const MAX_PULL_PER_DISTINCT_GUILD = MAX_UNBANS_PER_MINUTE_AND_PER_GUILD * 2;

const { tempBannedMembers: tempBannedMembersTable } = prisma;

async function attemptToPullTempBannedMembersBatchFromDB(batchSize: Limit, excludedGuildsIds: Array<Guild['id']> = []): Promise<TempBannedMembers[]> {
  let batch: TempBannedMembers[] = [];

  try {
    await verrou
      .use('redis')
      .createLock(VERROU_HANDLE_TEMP_BANS_JOB_LOCK_KEYS.ATTEMPT_TO_PULL_TEMP_BANNED_MEMBERS_BATCH_FROM_DB, '1m')
      .runImmediately(async () => {
        try {
          const todayUTC = toUTC(new Date());

          // NOTE: https://github.com/prisma/prisma/issues/14765#issuecomment-1845646423
          const xs = await tempBannedMembersTable.findMany({
            where: {
              discordGuildId: {
                notIn: excludedGuildsIds.map(BigInt)
              },

              until: {
                lt: todayUTC
              }
            },

            select: {
              discordGuildId: true
            },

            distinct: ['discordGuildId'],
            take: batchSize
          });

          let __updatedBatchSize = batchSize;

          for (const x of xs) {
            if (__updatedBatchSize <= 0) break;

            const take = Math.min(__updatedBatchSize, MAX_PULL_PER_DISTINCT_GUILD);

            const tempBannedMembers: TempBannedMembers[] = await tempBannedMembersTable.findMany({
              where: {
                until: {
                  lt: todayUTC
                },

                discordGuildId: x.discordGuildId
              },

              orderBy: {
                until: 'asc'
              },

              take
            });

            batch.push(...tempBannedMembers);
            __updatedBatchSize -= take;
          }
        } catch (error) {
          traceError(error, { from: attemptToPullTempBannedMembersBatchFromDB.name, args: { excludedGuildsIds, batchSize } });
        }
      });
  } catch {}

  return batch;
}

export default attemptToPullTempBannedMembersBatchFromDB;
