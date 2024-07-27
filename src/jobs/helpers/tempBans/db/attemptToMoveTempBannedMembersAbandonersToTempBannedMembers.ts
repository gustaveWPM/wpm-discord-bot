import type { TempBannedMembersAbandoners } from '@prisma/client';
import type { Guild, User } from 'discord.js';

import { TRANSACTION_FAILED_DUE_TO_A_WRITE_CONFLICT_OR_A_DEADLOCK_PLEASE_RETRY_YOUR_TRANSACTION } from '@wpm-discord-bot/shared-specs/Prisma';
import tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy from '#@/db/dsl/jit/tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy';
import lazilyFetchGuildMember from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchGuildMember';
import verrou, { verrouKeysFactory } from '#@/config/verrou';
import traceError from '#@/helpers/interactions/traceError';
import { getDiscordBotId } from '#@/client';
import { Prisma } from '@prisma/client';
import prisma from '#@/db/prisma';

import getFilteredTempBannedMembersToMoveToBannedMembersArchiveAndUpdatedFilteredTempBannedMembers from './helpers/getFilteredTempBannedMembersToMoveToBannedMembersArchiveAndUpdatedFilteredTempBannedMembers';
import indexExistingMembers from './helpers/utils/indexExistingMembers';
import shouldMoveMember from './helpers/shouldMoveMember';
import skillIssueMsg from './helpers/skillIssueMsg';

const [fromTable, toTable] = [prisma.tempBannedMembersAbandoners, prisma.tempBannedMembers] as const;

/**
 * @throws {Prisma.PrismaClientKnownRequestError}
 * CASCADE
 */
async function tryToProcessTransaction({
  tempBannedMembersAbandoners,
  guildIdAsBigInt,
  guild
}: {
  tempBannedMembersAbandoners: TempBannedMembersAbandoners[];
  guildIdAsBigInt: bigint;
  guild: Guild;
}) {
  const { id: guildId } = guild;

  const indexedConflictMembers = indexExistingMembers(
    await toTable.findMany({
      select: { discordGuildId: true, discordUserId: true, bannedAt: true, until: true },
      where: { discordGuildId: guildIdAsBigInt }
    })
  );

  const __firstFilter = tempBannedMembersAbandoners.filter((newMemberCandidate) => shouldMoveMember(newMemberCandidate, indexedConflictMembers));

  const discordBotId = await getDiscordBotId();
  const botMember = await lazilyFetchGuildMember(guild, discordBotId);

  const botMemberIsAuthorizedToManageBans = botMember !== null && botMember.permissions.has('BanMembers');

  if (!botMemberIsAuthorizedToManageBans) {
    traceError(new Error(skillIssueMsg), { from: attemptToMoveTempBannedMembersAbandonersToTempBannedMembers.name });
  }

  const currentBannedMembersIds: Set<User['id']> = botMemberIsAuthorizedToManageBans
    ? new Set((await guild.bans.fetch()).keys())
    : new Set(__firstFilter.map(({ discordUserId }) => String(discordUserId)));

  const [filteredTempBannedMembersToMoveToBannedMembersArchive, updatedFilteredTempBannedMembers] = botMemberIsAuthorizedToManageBans
    ? getFilteredTempBannedMembersToMoveToBannedMembersArchiveAndUpdatedFilteredTempBannedMembers(__firstFilter, currentBannedMembersIds)
    : [[], __firstFilter];

  await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy({
    cb: async () => {
      await prisma.bannedMembersArchive.createMany({
        data: filteredTempBannedMembersToMoveToBannedMembersArchive.map((member) => ({
          discordMagicTimestampHostTimezone: member.discordMagicTimestampHostTimezone,
          discordMagicTimestamp: member.discordMagicTimestamp,
          discordGuildId: member.discordGuildId,
          discordUserId: member.discordUserId,
          bannedAt: member.bannedAt,
          bannedBy: member.bannedBy,
          reason: member.reason,
          until: member.until
        }))
      });

      await prisma.$transaction(
        [
          toTable.deleteMany({
            where: {
              discordUserId: { in: updatedFilteredTempBannedMembers.map((member) => member.discordUserId) },
              discordGuildId: guildIdAsBigInt
            }
          }),

          toTable.createMany({
            data: updatedFilteredTempBannedMembers.map((member) => ({
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
      );
    },

    guildId
  });
}

async function attemptToMoveTempBannedMembersAbandonersToTempBannedMembers(guild: Guild) {
  const { id: guildId } = guild;

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
              guild
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
              from: attemptToMoveTempBannedMembersAbandonersToTempBannedMembers.name,
              ctx: { guildId }
            });
          }
        }
      });
  } catch {}
}

export default attemptToMoveTempBannedMembersAbandonersToTempBannedMembers;
