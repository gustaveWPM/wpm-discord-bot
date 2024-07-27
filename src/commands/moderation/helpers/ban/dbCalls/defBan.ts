import type { DefBannedMembers } from '@wpm-discord-bot/shared-types/Database';
import type { ModerationReason } from '@wpm-discord-bot/shared-types/String';
import type { GuildMember, Guild, User } from 'discord.js';

import attemptToMoveTempBannedMemberToBannedMembersArchive from '#@/jobs/helpers/tempBans/db/attemptToMoveTempBannedMemberToBannedMembersArchive';
import attemptToMoveDefBannedMemberToBannedMembersArchive from '#@/jobs/helpers/tempBans/db/attemptToMoveDefBannedMemberToBannedMembersArchive';
import tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy from '#@/db/dsl/jit/tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy';
import { attemptToGetLanguageGuildSide } from '#𝕃/getLanguagePipelines';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import prisma from '#@/db/prisma';

const { defBannedMembers: prismaTable } = prisma;

/**
 * @throws {PrismaClientKnownRequestError}
 * CASCADE
 */
export const insertDefBanInDB = async ({
  callerMemberId,
  targetMemberId,
  guildId,
  reason
}: {
  callerMemberId: GuildMember['id'];
  targetMemberId: User['id'];
  reason: ModerationReason;
  guildId: Guild['id'];
}): Promise<DefBannedMembers> => ({
  ...(await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy({
    cb: async () => {
      const targetMemberIdAsBigInt = BigInt(targetMemberId);
      const guildIdAsBigInt = BigInt(guildId);

      const maybeStaleDefBan = await prismaTable.findUnique({
        where: {
          discordUserId_discordGuildId: {
            discordUserId: targetMemberIdAsBigInt,
            discordGuildId: guildIdAsBigInt
          }
        },

        select: { id: true }
      });

      const maybeStaleTempBan = await prisma.tempBannedMembers.findUnique({
        where: {
          discordUserId_discordGuildId: {
            discordUserId: targetMemberIdAsBigInt,
            discordGuildId: guildIdAsBigInt
          }
        },

        select: { id: true }
      });

      if (maybeStaleDefBan !== null) {
        await attemptToMoveDefBannedMemberToBannedMembersArchive(
          maybeStaleDefBan.id,
          guildId,
          vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).vocab.stale()
        );
      }

      if (maybeStaleTempBan !== null) {
        await attemptToMoveTempBannedMemberToBannedMembersArchive(
          maybeStaleTempBan.id,
          guildId,
          vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).vocab.stale()
        );
      }

      return await prismaTable.create({
        data: {
          discordGuild: {
            connect: { discordGuildId: guildIdAsBigInt }
          },

          discordUserId: targetMemberIdAsBigInt,
          bannedBy: BigInt(callerMemberId),
          reason
        }
      });
    },

    guildId
  })),

  __MY_PHANTOM_TYPE__: 'DefBannedMembers'
});

export async function attemptToDeleteDbEntry(dbEntry: DefBannedMembers) {
  try {
    await prismaTable.delete({ where: { id: dbEntry.id } });
  } catch {}
}
