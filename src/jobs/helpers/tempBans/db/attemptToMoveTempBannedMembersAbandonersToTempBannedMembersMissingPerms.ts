import type { TempBannedMembersAbandoners } from '@prisma/client';
import type { Guild } from 'discord.js';

import { TRANSACTION_FAILED_DUE_TO_A_WRITE_CONFLICT_OR_A_DEADLOCK_PLEASE_RETRY_YOUR_TRANSACTION } from '@wpm-discord-bot/shared-specs/Prisma';
import tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy from '#@/db/dsl/jit/tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy';
import verrou, { verrouKeysFactory } from '#@/config/verrou';
import traceError from '#@/helpers/interactions/traceError';
import { Prisma } from '@prisma/client';
import prisma from '#@/db/prisma';

import indexExistingMembers from './helpers/utils/indexExistingMembers';
import shouldMoveMember from './helpers/shouldMoveMember';

const [fromTable, toTable] = [prisma.tempBannedMembersAbandoners, prisma.tempBannedMembersMissingPermsToUnban] as const;

/**
 * @throws {Prisma.PrismaClientKnownRequestError}
 * CASCADE
 */
async function tryToProcessTransaction({
  tempBannedMembersAbandoners,
  guildIdAsBigInt,
  guildId
}: {
  tempBannedMembersAbandoners: TempBannedMembersAbandoners[];
  guildIdAsBigInt: bigint;
  guildId: Guild['id'];
}) {
  const indexedConflictMembers = indexExistingMembers(
    await toTable.findMany({
      select: { discordGuildId: true, discordUserId: true, bannedAt: true, until: true },
      where: { discordGuildId: guildIdAsBigInt }
    })
  );

  const filteredTempBannedMembersAbandoners = tempBannedMembersAbandoners.filter((newMemberCandidate) =>
    shouldMoveMember(newMemberCandidate, indexedConflictMembers)
  );

  await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy({
    cb: async () =>
      await prisma.$transaction(
        [
          toTable.deleteMany({
            where: {
              discordUserId: { in: filteredTempBannedMembersAbandoners.map((member) => member.discordUserId) },
              discordGuildId: guildIdAsBigInt
            }
          }),

          toTable.createMany({
            data: filteredTempBannedMembersAbandoners.map((member) => ({
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

async function attemptToMoveTempBannedMembersAbandonersToTempBannedMissingPerms(guildId: Guild['id']) {
  try {
    await verrou
      .use('redis')
      .createLock(verrouKeysFactory.HANDLE_TEMP_BANS_JOB_LOCK_KEYS.attemptToUpdateBannedMembers(guildId), '1m')
      .run(async () => {
        try {
          const guildIdAsBigInt = BigInt(guildId);

          const maybeTempBannedMembersAbandoners: TempBannedMembersAbandoners[] = await fromTable.findMany({
            where: { discordGuildId: guildIdAsBigInt }
          });

          if (maybeTempBannedMembersAbandoners.length > 0) {
            await tryToProcessTransaction({
              tempBannedMembersAbandoners: maybeTempBannedMembersAbandoners,
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
              from: attemptToMoveTempBannedMembersAbandonersToTempBannedMissingPerms.name,
              args: { guildId }
            });
          }
        }
      });
  } catch {}
}

export default attemptToMoveTempBannedMembersAbandonersToTempBannedMissingPerms;
