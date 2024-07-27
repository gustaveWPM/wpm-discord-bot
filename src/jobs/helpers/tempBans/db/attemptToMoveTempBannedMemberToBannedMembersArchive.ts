import type { AttemptToResultCtx, MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { ModerationReason } from '@wpm-discord-bot/shared-types/String';
import type { TempBannedMembers } from '@prisma/client';
import type { Guild } from 'discord.js';

import { TRANSACTION_FAILED_DUE_TO_A_WRITE_CONFLICT_OR_A_DEADLOCK_PLEASE_RETRY_YOUR_TRANSACTION } from '@wpm-discord-bot/shared-specs/Prisma';
import tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy from '#@/db/dsl/jit/tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy';
import verrou, { verrouKeysFactory } from '#@/config/verrou';
import traceError from '#@/helpers/interactions/traceError';
import { Prisma } from '@prisma/client';
import prisma from '#@/db/prisma';

const [fromTable, toTable] = [prisma.tempBannedMembers, prisma.bannedMembersArchive] as const;

/**
 * @throws {Prisma.PrismaClientKnownRequestError}
 * CASCADE
 */
async function tryToProcessTransaction({
  tempBannedMember,
  unbanReason,
  guildId
}: {
  unbanReason: MaybeNull<ModerationReason>;
  tempBannedMember: TempBannedMembers;
  guildId: Guild['id'];
}) {
  await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy({
    cb: async () =>
      await prisma.$transaction(
        [
          toTable.create({
            data: {
              discordGuild: {
                connect: { discordGuildId: tempBannedMember.discordGuildId }
              },

              discordMagicTimestampHostTimezone: tempBannedMember.discordMagicTimestampHostTimezone,
              discordMagicTimestamp: tempBannedMember.discordMagicTimestamp,
              discordUserId: tempBannedMember.discordUserId,
              bannedAt: tempBannedMember.bannedAt,
              bannedBy: tempBannedMember.bannedBy,
              reason: tempBannedMember.reason,
              until: tempBannedMember.until,
              unbanReason
            }
          }),

          fromTable.delete({
            where: { id: tempBannedMember.id }
          })
        ],

        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        }
      ),

    guildId
  });
}

async function attemptToMoveTempBannedMemberToBannedMembersArchive(
  tempBannedMemberEntryId: TempBannedMembers['id'],
  guildId: Guild['id'],
  unbanReason: MaybeNull<ModerationReason> = null
): Promise<AttemptToMoveTempBannedMemberToBannedMembersArchiveRes> {
  const res: AttemptToMoveTempBannedMemberToBannedMembersArchiveRes = {};

  try {
    await verrou
      .use('redis')
      .createLock(verrouKeysFactory.HANDLE_TEMP_BANS_JOB_LOCK_KEYS.attemptToUpdateBannedMembers(guildId), '1m')
      .run(async () => {
        try {
          const maybeTempBannedMember = await fromTable.findUnique({
            where: { id: tempBannedMemberEntryId }
          });

          if (maybeTempBannedMember !== null) {
            await tryToProcessTransaction({
              tempBannedMember: maybeTempBannedMember,
              unbanReason,
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
              args: { tempBannedMemberEntryId: String(tempBannedMemberEntryId) },
              from: attemptToMoveTempBannedMemberToBannedMembersArchive.name
            });
          }

          res.failureCtx = error;
        }
      });
  } catch (error) {
    res.failureCtx = error;
  }

  return res;
}

export default attemptToMoveTempBannedMemberToBannedMembersArchive;

type AttemptToMoveTempBannedMemberToBannedMembersArchiveRes = AttemptToResultCtx;
