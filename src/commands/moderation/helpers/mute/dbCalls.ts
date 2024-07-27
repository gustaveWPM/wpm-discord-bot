import type { ModerationReason } from '@wpm-discord-bot/shared-types/String';
import type { GuildMember, Guild, User } from 'discord.js';
import type { MutedMembers } from '@prisma/client';

import tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy from '#@/db/dsl/jit/tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy';
import prisma from '#@/db/prisma';

const { mutedMembers: prismaTable } = prisma;

/**
 * @throws {PrismaClientKnownRequestError}
 */
export const countPastMutesAmount = ({ memberId, guildId }: { memberId: User['id']; guildId: Guild['id'] }) =>
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
export const insertMuteInDB = async ({
  discordMagicTimestamp,
  callerMemberId,
  targetMemberId,
  untilUTC,
  guildId,
  reason
}: {
  callerMemberId: GuildMember['id'];
  discordMagicTimestamp: bigint;
  targetMemberId: User['id'];
  reason: ModerationReason;
  guildId: Guild['id'];
  untilUTC: Date;
}) =>
  await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy({
    cb: async () =>
      await prismaTable.create({
        data: {
          discordGuild: {
            connect: { discordGuildId: BigInt(guildId) }
          },

          discordMagicTimestampHostTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          discordUserId: BigInt(targetMemberId),
          mutedBy: BigInt(callerMemberId),
          discordMagicTimestamp,
          until: untilUTC,
          reason
        }
      }),

    guildId
  });

export async function attemptToDeleteDbEntry(dbEntry: MutedMembers) {
  try {
    await prismaTable.delete({ where: { id: dbEntry.id } });
  } catch {}
}
