import type { Guild, User } from 'discord.js';

import prisma from '#@/db/prisma';

const { bannedMembersArchive: prismaTable } = prisma;

/**
 * @throws {PrismaClientKnownRequestError}
 */
export const countPastBansAmount = ({ memberId, guildId }: { memberId: User['id']; guildId: Guild['id'] }) =>
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
