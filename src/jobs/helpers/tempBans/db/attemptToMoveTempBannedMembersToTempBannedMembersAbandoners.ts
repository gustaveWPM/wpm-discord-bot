import type { TempBannedMembers } from '@prisma/client';
import type { Guild } from 'discord.js';

import { TRANSACTION_FAILED_DUE_TO_A_WRITE_CONFLICT_OR_A_DEADLOCK_PLEASE_RETRY_YOUR_TRANSACTION } from '@wpm-discord-bot/shared-specs/Prisma';
import tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy from '#@/db/dsl/jit/tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy';
import verrou, { verrouKeysFactory } from '#@/config/verrou';
import traceError from '#@/helpers/interactions/traceError';
import { Prisma } from '@prisma/client';
import prisma from '#@/db/prisma';

import indexExistingMembers from './helpers/utils/indexExistingMembers';
import shouldMoveMember from './helpers/shouldMoveMember';

const [fromTable, toTable] = [prisma.tempBannedMembers, prisma.tempBannedMembersAbandoners] as const;

/**
 * @throws {Prisma.PrismaClientKnownRequestError}
 * CASCADE
 */
async function tryToProcessTransaction({
  tempBannedMembers,
  guildIdAsBigInt,
  guildId
}: {
  tempBannedMembers: TempBannedMembers[];
  guildIdAsBigInt: bigint;
  guildId: Guild['id'];
}) {
  const indexedConflictMembers = indexExistingMembers(
    await toTable.findMany({
      select: { discordGuildId: true, discordUserId: true, bannedAt: true, until: true },
      where: { discordGuildId: guildIdAsBigInt }
    })
  );

  const filteredTempBannedMembers = tempBannedMembers.filter((newMemberCandidate) => shouldMoveMember(newMemberCandidate, indexedConflictMembers));

  await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy({
    cb: async () =>
      await prisma.$transaction(
        [
          toTable.deleteMany({
            where: {
              discordUserId: { in: filteredTempBannedMembers.map((member) => member.discordUserId) },
              discordGuildId: guildIdAsBigInt
            }
          }),

          toTable.createMany({
            data: filteredTempBannedMembers.map((member) => ({
              discordMagicTimestampHostTimezone: member.discordMagicTimestampHostTimezone,
              discordMagicTimestamp: member.discordMagicTimestamp,
              discordGuildId: member.discordGuildId,
              discordUserId: member.discordUserId,
              bannedAt: member.bannedAt,
              bannedBy: member.bannedBy,
              reason: member.reason,
              until: member.until
            }))
          }),

          fromTable.deleteMany({
            where: { discordGuildId: guildIdAsBigInt }
          })
        ],

        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        }
      ),

    guildId
  });
}

async function attemptToMoveTempBannedMembersToTempBannedMembersAbandoners(guildId: Guild['id']) {
  try {
    await verrou
      .use('redis')
      .createLock(verrouKeysFactory.HANDLE_TEMP_BANS_JOB_LOCK_KEYS.attemptToUpdateBannedMembers(guildId), '1m')
      .run(async () => {
        try {
          const guildIdAsBigInt = BigInt(guildId);

          const maybeTempBannedMembers: TempBannedMembers[] = await fromTable.findMany({
            where: { discordGuildId: guildIdAsBigInt }
          });

          if (maybeTempBannedMembers.length > 0) {
            await tryToProcessTransaction({
              tempBannedMembers: maybeTempBannedMembers,
              guildIdAsBigInt,
              guildId
            });
          }
        } catch (error) {
          if (
            !(
              error instanceof Prisma.PrismaClientKnownRequestError &&
              error.code === TRANSACTION_FAILED_DUE_TO_A_WRITE_CONFLICT_OR_A_DEADLOCK_PLEASE_RETRY_YOUR_TRANSACTION
            )
          ) {
            traceError(error, {
              from: attemptToMoveTempBannedMembersToTempBannedMembersAbandoners.name,
              args: { guildId }
            });
          }
        }
      });
  } catch {}
}

export default attemptToMoveTempBannedMembersToTempBannedMembersAbandoners;
