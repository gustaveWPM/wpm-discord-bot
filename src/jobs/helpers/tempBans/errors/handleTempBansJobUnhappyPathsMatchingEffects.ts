import type { TempBannedMembers } from '@prisma/client';

import { attemptToTurnOnIsAbandonerFlag } from '#@/db/dsl/guilds/isAbandonerFlagTweakers';

import attemptToMoveTempBannedMembersToTempBannedMembersMissingPerms from '../db/attemptToMoveTempBannedMembersToTempBannedMembersMissingPerms';
import attemptToMoveTempBannedMemberToBannedMembersArchive from '../db/attemptToMoveTempBannedMemberToBannedMembersArchive';
import deleteCachePartition from '../redis/lowLevelRedisHell/deleteCachePartition';
import shiftCacheBanSlice from '../redis/lowLevelRedisHell/shiftCacheBanSlice';
import { EJobUnhappyPaths } from './EJobUnhappyPaths';

export const handleTempBansJobUnhappyPathsMatchingEffects = {
  [EJobUnhappyPaths.UNKNOWN_BAN]: async (tempBannedMember: TempBannedMembers) => {
    const tempBannedMemberDiscordGuildIdAsString = String(tempBannedMember.discordGuildId);
    const x = tempBannedMemberDiscordGuildIdAsString;

    await Promise.all([attemptToMoveTempBannedMemberToBannedMembersArchive(tempBannedMember.id, x), shiftCacheBanSlice(x)]);
  },

  [EJobUnhappyPaths.MISSING_PERMISSIONS]: async (tempBannedMember: TempBannedMembers) => {
    const tempBannedMemberDiscordGuildIdAsString = String(tempBannedMember.discordGuildId);
    const x = tempBannedMemberDiscordGuildIdAsString;

    await Promise.all([attemptToMoveTempBannedMembersToTempBannedMembersMissingPerms(x), deleteCachePartition(x)]);
  },

  [EJobUnhappyPaths.UNKNOWN_GUILD]: async (tempBannedMember: TempBannedMembers) => {
    const tempBannedMemberDiscordGuildIdAsString = String(tempBannedMember.discordGuildId);
    const x = tempBannedMemberDiscordGuildIdAsString;

    await Promise.all([attemptToTurnOnIsAbandonerFlag(x, { awaitGC: true }), deleteCachePartition(x)]);
  }
} as const satisfies Record<(typeof EJobUnhappyPaths)[keyof typeof EJobUnhappyPaths], (tempBannedMemberId: TempBannedMembers) => Promise<void>>;
