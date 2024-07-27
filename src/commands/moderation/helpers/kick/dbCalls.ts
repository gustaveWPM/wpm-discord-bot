import type { ModerationReason } from '@wpm-discord-bot/shared-types/String';
import type { GuildMember, Guild, User } from 'discord.js';
import type { KickedMembers } from '@prisma/client';

import tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy from '#@/db/dsl/jit/tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy';
import prisma from '#@/db/prisma';

const { kickedMembers: prismaTable } = prisma;

/**
 * @throws {PrismaClientKnownRequestError}
 */
export const countPastKicksAmount = async ({ memberId, guildId }: { memberId: User['id']; guildId: Guild['id'] }) =>
  await prismaTable.count({
    where: {
      AND: [
        {
          discordUserId: BigInt(memberId)
        },
        {
          discordGuildId: BigInt(guildId)
        }
      ]
    }
  });

/**
 * @throws {PrismaClientKnownRequestError}
 * CASCADE
 */
export const insertKickInDB = async ({
  callerMemberId,
  targetMemberId,
  guildId,
  reason
}: {
  callerMemberId: GuildMember['id'];
  targetMemberId: User['id'];
  reason: ModerationReason;
  guildId: Guild['id'];
}) =>
  await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy({
    cb: async () =>
      await prismaTable.create({
        data: {
          discordGuild: {
            connect: { discordGuildId: BigInt(guildId) }
          },

          discordUserId: BigInt(targetMemberId),
          kickedBy: BigInt(callerMemberId),
          reason
        }
      }),

    guildId
  });

export async function attemptToDeleteDbEntry(dbEntry: KickedMembers) {
  try {
    await prismaTable.delete({ where: { id: dbEntry.id } });
  } catch {}
}
