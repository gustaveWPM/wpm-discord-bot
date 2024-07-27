import type { Guild, User } from 'discord.js';

import { redisStore } from '@verrou/core/drivers/redis';
import { jobsIds } from '#@/jobs/constants/ids';
import { Verrou } from '@verrou/core';

import { redisClient as connection } from './redis';

const verrou = new Verrou({
  stores: {
    redis: {
      driver: redisStore({ connection })
    }
  },

  default: 'redis'
});

export const VERROU_HANDLE_TEMP_BANS_JOB_LOCK_KEYS = {
  ATTEMPT_TO_PULL_TEMP_BANNED_MEMBERS_BATCH_FROM_DB: 'job:handle-temp-bans:attemptToPullTempBannedMembersBatchFromDB',
  ATTEMPT_TO_PULL_TIMEOUTS_ON_BOT_BATCH_FROM_DB: 'job:handle-timeout-on-bot:attemptToPullTimeoutsOnBotBatchFromDB',
  THROTTLING_CLEANUP_EXPIRED_COUNTERS: 'job:handle-temp-bans:rate-limit-throttling:cleanupExpiredCounters',
  TOP_UP_TEMP_BANS: jobsIds.TopUpTempBans,
  CACHE_TEMP_BANS: jobsIds.CacheTempBans
};

export const verrouKeysFactory = {
  HANDLE_TEMP_BANS_JOB_LOCK_KEYS: {
    attemptToUpdateBannedMembers: (guildId: Guild['id']) =>
      `job:handle-temp-bans:attemptToMoveTempBannedMembersMissingPermsToTempBannedMembersAbandoners:${guildId}`,
    attemptToUpdateTimeoutOnBot: (guildId: Guild['id']) => `job:handle-timeout-on-bot:attemptToUpsertTimeoutOnBot:${guildId}`
  },

  processingUnbanOnUserViaTheBot: (guildId: Guild['id'], userId: User['id']) =>
    `processing-unban-on-user-via-the-bot:guildId:${guildId}:userId:${userId}`,

  processingBanOnUserViaTheBot: (guildId: Guild['id'], userId: User['id']) =>
    `processing-ban-on-user-via-the-bot:guildId:${guildId}:userId:${userId}`,

  JITGuildCreate: (guildId: Guild['id']) => `jit:guild-create:guildId:${guildId}`
};

export default verrou;
