import type { Guild as DbEntryGuild } from '@prisma/client';
import type { Guild } from 'discord.js';

import attemptToMoveTempBannedMembersMissingPermsToTempBannedMembersAbandoners from '#@/jobs/helpers/tempBans/db/attemptToMoveTempBannedMembersMissingPermsToTempBannedMembersAbandoners';
import attemptToMoveTempBannedMembersAbandonersToTempBannedMissingPerms from '#@/jobs/helpers/tempBans/db/attemptToMoveTempBannedMembersAbandonersToTempBannedMembersMissingPerms';
import attemptToMoveTempBannedMembersMissingPermsToTempBannedMembers from '#@/jobs/helpers/tempBans/db/attemptToMoveTempBannedMembersMissingPermsToTempBannedMembers';
import attemptToMoveTempBannedMembersToTempBannedMembersAbandoners from '#@/jobs/helpers/tempBans/db/attemptToMoveTempBannedMembersToTempBannedMembersAbandoners';
import attemptToMoveTempBannedMembersAbandonersToTempBannedMembers from '#@/jobs/helpers/tempBans/db/attemptToMoveTempBannedMembersAbandonersToTempBannedMembers';
import wait from '@wpm-discord-bot/shared-lib/portable/promise/wait';
import toUTC from '@wpm-discord-bot/shared-lib/portable/date/toUTC';
import traceError from '#@/helpers/interactions/traceError';
import prisma from '#@/db/prisma';

import tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy from '../jit/tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy';

async function justAttemptToTurnOffIsAbandonerFlag(guildId: Guild['id']) {
  const guildIdAsBigInt = BigInt(guildId);

  const maybeGuild = await prisma.guild.findUnique({
    where: { discordGuildId: guildIdAsBigInt },
    select: { isAbandoner: true }
  });

  if (maybeGuild === null) return;

  const isAbandonerTargetValue = false;
  if (maybeGuild.isAbandoner === isAbandonerTargetValue) return;

  await prisma.guild.update({
    data: { isAbandoner: isAbandonerTargetValue, isAbandonerSince: null },
    where: { discordGuildId: guildIdAsBigInt }
  });
}

export async function attemptToTurnOffIsAbandonerFlagWithUnauthorizedToManageBansBotClient(guildId: Guild['id'], options: Options = {}) {
  try {
    await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy(
      {
        cb: async () => {
          await justAttemptToTurnOffIsAbandonerFlag(guildId);

          if (options.awaitGC) {
            await attemptToMoveTempBannedMembersAbandonersToTempBannedMissingPerms(guildId);
          } else {
            attemptToMoveTempBannedMembersAbandonersToTempBannedMissingPerms(guildId);
          }
        },

        guildId
      },

      { fromAttemptToTurnOffIsAbandonerFlag: true }
    );
  } catch (error) {
    traceError(error, { from: attemptToTurnOffIsAbandonerFlagWithUnauthorizedToManageBansBotClient.name, args: { guildId, options } });
  }
}

export async function attemptToTurnOffIsAbandonerFlagWithAuthorizedToManageBansBotClient(guild: Guild, options: Options = {}) {
  const { id: guildId } = guild;

  try {
    await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy(
      {
        cb: async () => {
          await justAttemptToTurnOffIsAbandonerFlag(guildId);

          if (options.awaitGC) {
            await attemptToMoveTempBannedMembersAbandonersToTempBannedMembers(guild);
            await attemptToMoveTempBannedMembersMissingPermsToTempBannedMembers(guild);
          } else {
            attemptToMoveTempBannedMembersAbandonersToTempBannedMembers(guild);
            await wait(1);
            attemptToMoveTempBannedMembersMissingPermsToTempBannedMembers(guild);
          }
        },

        guildId
      },

      { fromAttemptToTurnOffIsAbandonerFlag: true }
    );
  } catch (error) {
    traceError(error, { from: attemptToTurnOffIsAbandonerFlagWithAuthorizedToManageBansBotClient.name, args: { options }, ctx: { guildId } });
  }
}

export async function justAttemptToTurnOnIsAbandonerFlag(guild: Pick<DbEntryGuild, 'isAbandoner'>, guildId: Guild['id'], options: Options = {}) {
  const isAbandonerTargetValue = true;
  if (guild.isAbandoner === isAbandonerTargetValue) return;

  const guildIdAsBigInt = BigInt(guildId);

  await prisma.guild.update({
    data: { isAbandonerSince: toUTC(new Date()), isAbandoner: isAbandonerTargetValue },
    where: { discordGuildId: guildIdAsBigInt }
  });

  if (options.awaitGC) {
    await attemptToMoveTempBannedMembersMissingPermsToTempBannedMembersAbandoners(guildId);
    await attemptToMoveTempBannedMembersToTempBannedMembersAbandoners(guildId);
    return;
  }

  attemptToMoveTempBannedMembersMissingPermsToTempBannedMembersAbandoners(guildId);
  await wait(1);
  attemptToMoveTempBannedMembersToTempBannedMembersAbandoners(guildId);
}

export async function attemptToTurnOnIsAbandonerFlag(guildId: Guild['id'], options: Options = {}) {
  try {
    await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy({
      cb: async () => {
        const guildIdAsBigInt = BigInt(guildId);

        const maybeGuild = await prisma.guild.findUnique({
          where: { discordGuildId: guildIdAsBigInt },
          select: { isAbandoner: true }
        });

        if (maybeGuild === null) return;

        await justAttemptToTurnOnIsAbandonerFlag(maybeGuild, guildId, options);
      },

      guildId
    });
  } catch (error) {
    traceError(error, { from: attemptToTurnOnIsAbandonerFlag.name, args: { guildId, options } });
  }
}

type Options = Partial<{ awaitGC: boolean }>;
