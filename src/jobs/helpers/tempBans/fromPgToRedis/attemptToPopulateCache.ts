import type { PartitionnedTempBans } from '#@/jobs/types/handleTempBans';
import type { Limit } from '@wpm-discord-bot/shared-types/Number';
import type { TempBannedMembers } from '@prisma/client';
import type { Guild } from 'discord.js';

import { REDIS_HANDLE_TEMP_BANS_JOB, redisClient } from '#@/config/redis';
import { BATCH_SIZE } from '#@/jobs/handleTempBans';
import { Command } from 'ioredis';

import attemptToPullTempBannedMembersBatchFromDB from '../db/attemptToPullTempBannedMembersBatchFromDB';

const partitionBansByGuildId = (banEntries: TempBannedMembers[]): PartitionnedTempBans =>
  banEntries.reduce<PartitionnedTempBans>((acc, entry) => {
    const guildId = String(entry.discordGuildId);
    if (acc[guildId] === undefined) acc[guildId] = [];
    (acc as any)[guildId].push(entry);
    return acc;
  }, {});

async function pushPartitionsSlicesIntoCache(newPartitions: PartitionnedTempBans) {
  for (const [guildId, slice] of Object.entries(newPartitions)) {
    const path = `$.${guildId}` as const;

    const checkTypeCommand = new Command('JSON.TYPE', [REDIS_HANDLE_TEMP_BANS_JOB.CACHE, path]);
    const missingGuildIdInCache = (await redisClient.sendCommand(checkTypeCommand)) === null;

    if (missingGuildIdInCache) {
      const initializeGuildIdListInCacheCommand = new Command('JSON.SET', [REDIS_HANDLE_TEMP_BANS_JOB.CACHE, path, '[]']);
      await redisClient.sendCommand(initializeGuildIdListInCacheCommand);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const jsonSlices = slice.map((entry) => JSON.stringify(entry, (_, v) => (typeof v === 'bigint' ? String(v) : v)));

    await Promise.all(
      jsonSlices.map(async (slice) => {
        const pushPartitionSliceToGuildIdListCommand = new Command('JSON.ARRAPPEND', [REDIS_HANDLE_TEMP_BANS_JOB.CACHE, path, slice]);

        await redisClient.sendCommand(pushPartitionSliceToGuildIdListCommand);
      })
    );
  }
}

const attemptToPopulateCache = async (__BATCH_SIZE: Limit = BATCH_SIZE, excludedGuildsIds: Array<Guild['id']> = []) =>
  await pushPartitionsSlicesIntoCache(partitionBansByGuildId(await attemptToPullTempBannedMembersBatchFromDB(__BATCH_SIZE, excludedGuildsIds)));

export default attemptToPopulateCache;
