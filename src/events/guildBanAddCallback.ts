import type { MaybeNull, NotNull } from '@wpm-discord-bot/shared-types/Utils';
import type { ModerationReason } from '@wpm-discord-bot/shared-types/String';
import type { TempBannedMembers, DefBannedMembers } from '@prisma/client';
import type { GuildMember, GuildBan, Guild, User } from 'discord.js';

import { TRANSACTION_FAILED_DUE_TO_A_WRITE_CONFLICT_OR_A_DEADLOCK_PLEASE_RETRY_YOUR_TRANSACTION } from '@wpm-discord-bot/shared-specs/Prisma';
import tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy from '#@/db/dsl/jit/tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy';
import { attemptToTurnOffIsAbandonerFlagWithAuthorizedToManageBansBotClient } from '#@/db/dsl/guilds/isAbandonerFlagTweakers';
import getBannedByMemberIdFromLogs from '@wpm-discord-bot/shared-lib/discordjs/getBannedByMemberIdFromLogs';
import { attemptToGetLanguageGuildSide } from '#𝕃/getLanguagePipelines';
import { NO_USER_ID } from '@wpm-discord-bot/shared-specs/Discord';
import verrou, { verrouKeysFactory } from '#@/config/verrou';
import traceError from '#@/helpers/interactions/traceError';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import { getDiscordBotId } from '#@/client';
import { Prisma } from '@prisma/client';
import prisma from '#@/db/prisma';

const transactionOptions = {
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable
} as const;

async function attemptToHandleStaleTempBan({
  maybeStaleDefBanEntry,
  staleTempBanEntry,
  bannedByMemberId,
  bannedUserId,
  guildBan,
  reason
}: {
  staleTempBanEntry: Pick<TempBannedMembers, 'discordMagicTimestamp' | 'bannedAt' | 'bannedBy' | 'reason' | 'until' | 'id'>;
  maybeStaleDefBanEntry: MaybeNull<Pick<DefBannedMembers, 'bannedAt' | 'bannedBy' | 'reason' | 'id'>>;
  bannedByMemberId: GuildMember['id'];
  reason: ModerationReason;
  bannedUserId: User['id'];
  guildBan: GuildBan;
}) {
  const guildId = guildBan.guild.id;
  const guildIdAsBigInt = BigInt(guildId);
  const bannedUserIdAsBigInt = BigInt(bannedUserId);

  const tempBanStrongerThanDefBan = maybeStaleDefBanEntry === null ? true : staleTempBanEntry.bannedAt > maybeStaleDefBanEntry.bannedAt;

  const reconciliatedBannedByMemberId =
    bannedByMemberId === NO_USER_ID
      ? tempBanStrongerThanDefBan
        ? staleTempBanEntry.bannedBy
        : (maybeStaleDefBanEntry as NotNull<typeof maybeStaleDefBanEntry>).bannedBy
      : BigInt(bannedByMemberId);

  const reconciliatedReason =
    (guildBan.reason ?? null) === null
      ? tempBanStrongerThanDefBan
        ? staleTempBanEntry.reason
        : (maybeStaleDefBanEntry as NotNull<typeof maybeStaleDefBanEntry>).reason
      : reason;

  try {
    await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy({
      cb: async () =>
        maybeStaleDefBanEntry === null
          ? await prisma.$transaction(
              [
                prisma.tempBannedMembers.delete({
                  where: {
                    id: staleTempBanEntry.id
                  }
                }),

                prisma.tempBannedMembers.create({
                  data: {
                    discordGuild: {
                      connect: { discordGuildId: guildIdAsBigInt }
                    },

                    discordMagicTimestampHostTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    discordMagicTimestamp: staleTempBanEntry.discordMagicTimestamp,
                    bannedBy: reconciliatedBannedByMemberId,
                    bannedAt: staleTempBanEntry.bannedAt,
                    discordUserId: bannedUserIdAsBigInt,
                    until: staleTempBanEntry.until,
                    reason: reconciliatedReason
                  }
                })
              ],

              transactionOptions
            )
          : tempBanStrongerThanDefBan
            ? await prisma.$transaction(
                [
                  prisma.defBannedMembers.delete({
                    where: {
                      id: maybeStaleDefBanEntry.id
                    }
                  }),

                  prisma.tempBannedMembers.delete({
                    where: {
                      id: staleTempBanEntry.id
                    }
                  }),

                  prisma.tempBannedMembers.create({
                    data: {
                      discordGuild: {
                        connect: { discordGuildId: guildIdAsBigInt }
                      },

                      discordMagicTimestampHostTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                      discordMagicTimestamp: staleTempBanEntry.discordMagicTimestamp,
                      bannedBy: reconciliatedBannedByMemberId,
                      bannedAt: staleTempBanEntry.bannedAt,
                      discordUserId: bannedUserIdAsBigInt,
                      until: staleTempBanEntry.until,
                      reason: reconciliatedReason
                    }
                  })
                ] as const,

                transactionOptions
              )
            : await prisma.$transaction(
                [
                  prisma.tempBannedMembers.delete({
                    where: {
                      id: staleTempBanEntry.id
                    }
                  }),

                  prisma.defBannedMembers.delete({
                    where: {
                      id: maybeStaleDefBanEntry.id
                    }
                  }),

                  prisma.defBannedMembers.create({
                    data: {
                      discordGuild: {
                        connect: { discordGuildId: guildIdAsBigInt }
                      },

                      bannedAt: maybeStaleDefBanEntry.bannedAt,
                      bannedBy: reconciliatedBannedByMemberId,
                      discordUserId: bannedUserIdAsBigInt,
                      reason: reconciliatedReason
                    }
                  })
                ] as const,

                transactionOptions
              ),

      guildId
    });
  } catch (error) {
    if (
      !(
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === TRANSACTION_FAILED_DUE_TO_A_WRITE_CONFLICT_OR_A_DEADLOCK_PLEASE_RETRY_YOUR_TRANSACTION
      )
    ) {
      traceError(error, { within: tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy.name, from: attemptToHandleStaleTempBan.name });
    }
  }
}

async function attemptToHandleStaleDefBan({
  staleDefBanEntry,
  bannedByMemberId,
  bannedUserId,
  guildBan,
  reason
}: {
  staleDefBanEntry: Pick<DefBannedMembers, 'bannedBy' | 'bannedAt' | 'reason' | 'id'>;
  maybeStaleDefBanEntry: MaybeNull<Pick<DefBannedMembers, 'id'>>;
  bannedByMemberId: GuildMember['id'];
  reason: ModerationReason;
  bannedUserId: User['id'];
  guildBan: GuildBan;
}) {
  try {
    const guildId = guildBan.guild.id;

    const reconciliatedBannedByMemberId = bannedByMemberId === NO_USER_ID ? staleDefBanEntry.bannedBy : BigInt(bannedByMemberId);
    const reconciliatedReason = (guildBan.reason ?? null) === null ? staleDefBanEntry.reason : reason;

    await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy({
      cb: async () =>
        await prisma.$transaction(
          [
            prisma.defBannedMembers.delete({
              where: {
                id: staleDefBanEntry.id
              }
            }),

            prisma.defBannedMembers.create({
              data: {
                discordGuild: {
                  connect: { discordGuildId: BigInt(guildId) }
                },

                bannedBy: reconciliatedBannedByMemberId,
                bannedAt: staleDefBanEntry.bannedAt,
                discordUserId: BigInt(bannedUserId),
                reason: reconciliatedReason
              }
            })
          ],

          transactionOptions
        ),

      guildId
    });
  } catch (error) {
    if (
      !(
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === TRANSACTION_FAILED_DUE_TO_A_WRITE_CONFLICT_OR_A_DEADLOCK_PLEASE_RETRY_YOUR_TRANSACTION
      )
    ) {
      traceError(error, { from: attemptToHandleStaleDefBan.name });
    }
  }
}

async function attemptToHandleFreshDefBan({
  bannedUserIdAsBigInt,
  bannedByMemberId,
  guildId,
  reason
}: {
  bannedUserIdAsBigInt: bigint;
  bannedByMemberId: User['id'];
  reason: ModerationReason;
  guildId: Guild['id'];
}) {
  try {
    await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy({
      cb: async () =>
        await prisma.defBannedMembers.create({
          data: {
            discordGuild: {
              connect: { discordGuildId: BigInt(guildId) }
            },

            discordUserId: bannedUserIdAsBigInt,
            bannedBy: BigInt(bannedByMemberId),
            reason
          }
        }),

      guildId
    });
  } catch (error) {
    traceError(error, { from: attemptToHandleFreshDefBan.name });
  }
}

async function getMaybeStaleDefBanEntry({ bannedUserIdAsBigInt, guildIdAsBigInt }: { bannedUserIdAsBigInt: bigint; guildIdAsBigInt: bigint }) {
  const maybeStaleDefBanEntry = await prisma.defBannedMembers.findUnique({
    where: {
      discordUserId_discordGuildId: {
        discordUserId: bannedUserIdAsBigInt,
        discordGuildId: guildIdAsBigInt
      }
    },

    select: {
      bannedBy: true,
      bannedAt: true,
      reason: true,
      id: true
    }
  });

  return maybeStaleDefBanEntry;
}

async function getMaybeStaleTempBanEntry({ bannedUserIdAsBigInt, guildIdAsBigInt }: { bannedUserIdAsBigInt: bigint; guildIdAsBigInt: bigint }) {
  const maybeStaleTempBanEntry = await prisma.tempBannedMembers.findUnique({
    select: {
      discordMagicTimestamp: true,
      bannedAt: true,
      bannedBy: true,
      reason: true,
      until: true,
      id: true
    },

    where: {
      discordUserId_discordGuildId: {
        discordUserId: bannedUserIdAsBigInt,
        discordGuildId: guildIdAsBigInt
      }
    }
  });

  return maybeStaleTempBanEntry;
}

async function guildBanAddCallback(guildBan: GuildBan) {
  const bannedUserId = guildBan.user.id;
  const { guild } = guildBan;
  const { id: guildId } = guild;
  const bannedUserIdAsBigInt = BigInt(bannedUserId);
  const guildIdAsBigInt = BigInt(guildId);

  try {
    await verrou
      .use('redis')
      .createLock(verrouKeysFactory.processingBanOnUserViaTheBot(guildId, bannedUserId), '10s')
      .run(async () => {
        const discordBotId = await getDiscordBotId();
        const bannedByMemberId = await getBannedByMemberIdFromLogs(guildBan, discordBotId);

        await attemptToTurnOffIsAbandonerFlagWithAuthorizedToManageBansBotClient(guild, { awaitGC: true });

        if (bannedByMemberId === discordBotId) return;

        if (guildBan.partial) guildBan = await guildBan.fetch(true);

        const reason: ModerationReason = guildBan.reason ?? vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).vocab.reasonNotSpecified();

        const maybeStaleDefBanEntry = await getMaybeStaleDefBanEntry({ bannedUserIdAsBigInt, guildIdAsBigInt });

        const maybeStaleTempBanEntry = await getMaybeStaleTempBanEntry({ bannedUserIdAsBigInt, guildIdAsBigInt });

        if (maybeStaleTempBanEntry !== null) {
          await attemptToHandleStaleTempBan({
            staleTempBanEntry: maybeStaleTempBanEntry,
            maybeStaleDefBanEntry,
            bannedByMemberId,
            bannedUserId,
            guildBan,
            reason
          });
        } else if (maybeStaleDefBanEntry !== null) {
          await attemptToHandleStaleDefBan({
            staleDefBanEntry: maybeStaleDefBanEntry,
            maybeStaleDefBanEntry,
            bannedByMemberId,
            bannedUserId,
            guildBan,
            reason
          });
        } else {
          await attemptToHandleFreshDefBan({
            bannedUserIdAsBigInt,
            bannedByMemberId,
            guildId,
            reason
          });
        }
      });
  } catch {}
}

export default guildBanAddCallback;
