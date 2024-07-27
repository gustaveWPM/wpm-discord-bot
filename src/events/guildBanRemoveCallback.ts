import type { ModerationReason } from '@wpm-discord-bot/shared-types/String';
import type { TempBannedMembers, DefBannedMembers } from '@prisma/client';
import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { GuildBan, Guild } from 'discord.js';

import attemptToMoveTempBannedMemberToBannedMembersArchive from '#@/jobs/helpers/tempBans/db/attemptToMoveTempBannedMemberToBannedMembersArchive';
import attemptToMoveDefBannedMemberToBannedMembersArchive from '#@/jobs/helpers/tempBans/db/attemptToMoveDefBannedMemberToBannedMembersArchive';
import { attemptToTurnOffIsAbandonerFlagWithAuthorizedToManageBansBotClient } from '#@/db/dsl/guilds/isAbandonerFlagTweakers';
import getBannedByMemberIdFromLogs from '@wpm-discord-bot/shared-lib/discordjs/getBannedByMemberIdFromLogs';
import verrou, { verrouKeysFactory } from '#@/config/verrou';
import traceError from '#@/helpers/interactions/traceError';
import { getDiscordBotId } from '#@/client';
import prisma from '#@/db/prisma';

async function getMaybeTempBanEntry({ unbannedUserIdAsBigInt, guildIdAsBigInt }: { unbannedUserIdAsBigInt: bigint; guildIdAsBigInt: bigint }) {
  const maybeTempBanEntry = await prisma.tempBannedMembers.findUnique({
    where: {
      discordUserId_discordGuildId: {
        discordUserId: unbannedUserIdAsBigInt,
        discordGuildId: guildIdAsBigInt
      }
    },

    select: { bannedAt: true, id: true }
  });

  return maybeTempBanEntry;
}

async function getMaybeDefBanEntry({ unbannedUserIdAsBigInt, guildIdAsBigInt }: { unbannedUserIdAsBigInt: bigint; guildIdAsBigInt: bigint }) {
  const maybeDefBanEntry = await prisma.defBannedMembers.findUnique({
    where: {
      discordUserId_discordGuildId: {
        discordUserId: unbannedUserIdAsBigInt,
        discordGuildId: guildIdAsBigInt
      }
    },

    select: { bannedAt: true, id: true }
  });

  return maybeDefBanEntry;
}

async function handleWorstConflictScenario({
  maybeTempBanEntry,
  maybeDefBanEntry,
  unbanReason,
  guildId
}: {
  maybeTempBanEntry: Pick<TempBannedMembers, 'bannedAt' | 'id'>;
  maybeDefBanEntry: Pick<DefBannedMembers, 'bannedAt' | 'id'>;
  unbanReason: MaybeNull<ModerationReason>;
  guildId: Guild['id'];
}) {
  const tempBanStrongerThanDefBan = maybeTempBanEntry.bannedAt > maybeDefBanEntry.bannedAt;

  const x = tempBanStrongerThanDefBan
    ? await attemptToMoveTempBannedMemberToBannedMembersArchive(maybeTempBanEntry.id, guildId, unbanReason)
    : await attemptToMoveDefBannedMemberToBannedMembersArchive(maybeDefBanEntry.id, guildId, unbanReason);

  if (x.failureCtx !== undefined) {
    traceError(x.failureCtx, {
      earlyTermination: `Stopped ${guildBanRemoveCallback.name}` + '#' + handleWorstConflictScenario.name + '!',
      within: attemptToMoveTempBannedMemberToBannedMembersArchive.name,
      from: guildBanRemoveCallback.name
    });

    return;
  }

  try {
    if (tempBanStrongerThanDefBan) {
      await prisma.defBannedMembers.delete({
        where: {
          id: maybeDefBanEntry.id
        }
      });
    } else {
      await prisma.tempBannedMembers.delete({
        where: {
          id: maybeTempBanEntry.id
        }
      });
    }
  } catch (error) {
    traceError(error, { within: 'prisma.defBannedMembers.delete', from: guildBanRemoveCallback.name });
  }
}

async function guildBanRemoveCallback(guildBan: GuildBan) {
  const unbannedUserId = guildBan.user.id;
  const { guild } = guildBan;
  const { id: guildId } = guild;

  try {
    await verrou
      .use('redis')
      .createLock(verrouKeysFactory.processingUnbanOnUserViaTheBot(guildId, unbannedUserId), '10s')
      .run(async () => {
        const discordBotId = await getDiscordBotId();
        const unbannedByMemberId = await getBannedByMemberIdFromLogs(guildBan, discordBotId);

        await attemptToTurnOffIsAbandonerFlagWithAuthorizedToManageBansBotClient(guild, { awaitGC: true });

        if (unbannedByMemberId === discordBotId) return;

        const unbanReason = null;
        const guildIdAsBigInt = BigInt(guildId);
        const unbannedUserIdAsBigInt = BigInt(unbannedUserId);

        if (guildBan.partial) guildBan = await guildBan.fetch(true);

        const maybeTempBanEntry = await getMaybeTempBanEntry({ unbannedUserIdAsBigInt, guildIdAsBigInt });

        const maybeDefBanEntry = await getMaybeDefBanEntry({ unbannedUserIdAsBigInt, guildIdAsBigInt });

        if (maybeTempBanEntry !== null) {
          if (maybeDefBanEntry !== null) {
            handleWorstConflictScenario({ maybeTempBanEntry, maybeDefBanEntry, unbanReason, guildId });
            return;
          }

          attemptToMoveTempBannedMemberToBannedMembersArchive(maybeTempBanEntry.id, guildId, unbanReason);
        } else if (maybeDefBanEntry !== null) {
          attemptToMoveDefBannedMemberToBannedMembersArchive(maybeDefBanEntry.id, guildId, unbanReason);
        }

        /* NOTE: we DON'T want to manage fresh unbans here: it's undecidable because of latency issues tied to this event handler, and lack of IDs support on guildBans (from Discord API side) to properly distinguish them. It would just result in duplicates entries in the DB archives.

        If the bot "Doesn't know" to what this unban is connected here, we assume that it is just because the unban should not be handled by the bot here in any way. */
      });
  } catch {}
}

export default guildBanRemoveCallback;
