import type { TempBannedMembers } from '@wpm-discord-bot/shared-types/Database';
import type { ModerationReason } from '@wpm-discord-bot/shared-types/String';
import type { GuildMember, Guild, User } from 'discord.js';

import attemptToMoveTempBannedMemberToBannedMembersArchive from '#@/jobs/helpers/tempBans/db/attemptToMoveTempBannedMemberToBannedMembersArchive';
import attemptToMoveDefBannedMemberToBannedMembersArchive from '#@/jobs/helpers/tempBans/db/attemptToMoveDefBannedMemberToBannedMembersArchive';
import tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy from '#@/db/dsl/jit/tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy';
import { attemptToGetLanguageGuildSide } from '#𝕃/getLanguagePipelines';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import prisma from '#@/db/prisma';

const { tempBannedMembers: prismaTable } = prisma;

/**
 * @throws {PrismaClientKnownRequestError}
 * CASCADE
 */
export const insertTempBanInDB = async ({
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
}): Promise<TempBannedMembers> => ({
  ...(await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy({
    cb: async () => {
      const targetMemberIdAsBigInt = BigInt(targetMemberId);
      const guildIdAsBigInt = BigInt(guildId);

      const maybeStaleTempBan = await prismaTable.findUnique({
        where: {
          discordUserId_discordGuildId: {
            discordUserId: targetMemberIdAsBigInt,
            discordGuildId: guildIdAsBigInt
          }
        },

        select: { id: true }
      });

      const maybeStaleDefBan = await prisma.defBannedMembers.findUnique({
        where: {
          discordUserId_discordGuildId: {
            discordUserId: targetMemberIdAsBigInt,
            discordGuildId: guildIdAsBigInt
          }
        },

        select: { id: true }
      });

      if (maybeStaleTempBan !== null) {
        await attemptToMoveTempBannedMemberToBannedMembersArchive(
          maybeStaleTempBan.id,
          guildId,
          vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).vocab.stale()
        );
      }

      if (maybeStaleDefBan !== null) {
        await attemptToMoveDefBannedMemberToBannedMembersArchive(
          maybeStaleDefBan.id,
          guildId,
          vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).vocab.stale()
        );
      }

      return await prismaTable.create({
        data: {
          discordGuild: {
            connect: { discordGuildId: guildIdAsBigInt }
          },

          discordMagicTimestampHostTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          discordUserId: targetMemberIdAsBigInt,
          bannedBy: BigInt(callerMemberId),
          discordMagicTimestamp,
          until: untilUTC,
          reason
        }
      });
    },

    guildId
  })),

  __MY_PHANTOM_TYPE__: 'TempBannedMembers'
});

export async function attemptToDeleteDbEntry(dbEntry: TempBannedMembers) {
  try {
    await prismaTable.delete({ where: { id: dbEntry.id } });
  } catch {}
}
