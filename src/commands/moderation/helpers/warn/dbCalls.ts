import type { ModerationReason } from '@wpm-discord-bot/shared-types/String';
import type { GuildMember, Guild, User } from 'discord.js';
import type { WarnedMembers } from '@prisma/client';

import tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy from '#@/db/dsl/jit/tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy';
import prisma from '#@/db/prisma';

const { warnedMembers: prismaTable } = prisma;

/**
 * @throws {PrismaClientKnownRequestError}
 */
export const countPastWarnsAmount = ({ memberId, guildId }: { memberId: User['id']; guildId: Guild['id'] }) =>
  prismaTable.count({
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
export const insertWarnInDB = async ({
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
          warnedBy: BigInt(callerMemberId),
          reason
        }
      }),

    guildId
  });

export async function attemptToDeleteDbEntry(dbEntry: WarnedMembers) {
  try {
    await prismaTable.delete({ where: { id: dbEntry.id } });
  } catch {}
}
