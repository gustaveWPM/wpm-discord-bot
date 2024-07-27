import type { AttemptToResultCtx, MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { ModerationReason } from '@wpm-discord-bot/shared-types/String';
import type { DefBannedMembers } from '@prisma/client';
import type { Guild } from 'discord.js';

import { TRANSACTION_FAILED_DUE_TO_A_WRITE_CONFLICT_OR_A_DEADLOCK_PLEASE_RETRY_YOUR_TRANSACTION } from '@wpm-discord-bot/shared-specs/Prisma';
import tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy from '#@/db/dsl/jit/tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy';
import verrou, { verrouKeysFactory } from '#@/config/verrou';
import traceError from '#@/helpers/interactions/traceError';
import { Prisma } from '@prisma/client';
import prisma from '#@/db/prisma';

const [fromTable, toTable] = [prisma.defBannedMembers, prisma.bannedMembersArchive] as const;

/**
 * @throws {Prisma.PrismaClientKnownRequestError}
 * CASCADE
 */
async function tryToProcessTransaction({
  defBannedMember,
  unbanReason,
  guildId
}: {
  unbanReason: MaybeNull<ModerationReason>;
  defBannedMember: DefBannedMembers;
  guildId: Guild['id'];
}) {
  await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy({
    cb: async () =>
      await prisma.$transaction(
        [
          toTable.create({
            data: {
              discordGuild: {
                connect: { discordGuildId: defBannedMember.discordGuildId }
              },

              discordUserId: defBannedMember.discordUserId,
              bannedAt: defBannedMember.bannedAt,
              bannedBy: defBannedMember.bannedBy,
              reason: defBannedMember.reason,
              unbanReason
            }
          }),

          fromTable.delete({
            where: { id: defBannedMember.id }
          })
        ],

        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        }
      ),

    guildId
  });
}

async function attemptToMoveDefBannedMemberToBannedMembersArchive(
  defBannedMemberEntryId: DefBannedMembers['id'],
  guildId: Guild['id'],
  unbanReason: MaybeNull<ModerationReason> = null
) {
  const res: AttemptToMoveDefBannedMemberToBannedMembersArchiveRes = {};

  try {
    await verrou
      .use('redis')
      .createLock(verrouKeysFactory.HANDLE_TEMP_BANS_JOB_LOCK_KEYS.attemptToUpdateBannedMembers(guildId), '1m')
      .run(async () => {
        try {
          const maybeDefBannedMember = await fromTable.findUnique({
            where: { id: defBannedMemberEntryId }
          });

          if (maybeDefBannedMember !== null) {
            await tryToProcessTransaction({
              defBannedMember: maybeDefBannedMember,
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
              args: { defBannedMemberEntryId: String(defBannedMemberEntryId) },
              from: attemptToMoveDefBannedMemberToBannedMembersArchive.name
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

export default attemptToMoveDefBannedMemberToBannedMembersArchive;

type AttemptToMoveDefBannedMemberToBannedMembersArchiveRes = AttemptToResultCtx;
