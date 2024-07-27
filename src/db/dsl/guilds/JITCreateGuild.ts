import type { GuildWithIsNewTag } from '@wpm-discord-bot/shared-types/Database';
import type { MaybeNull, NotNull } from '@wpm-discord-bot/shared-types/Utils';
import type { Guild as DbEntryGuild } from '@prisma/client';
import type { Guild } from 'discord.js';

import lazilyFetchGuildWithAutowiredClient from '#@/lib/discordjs/lazilyFetchGuildWithAutowiredClient';
import toUTC from '@wpm-discord-bot/shared-lib/portable/date/toUTC';
import verrou, { verrouKeysFactory } from '#@/config/verrou';
import traceError from '#@/helpers/interactions/traceError';
import prisma from '#@/db/prisma';

import { justAttemptToTurnOnIsAbandonerFlag } from './isAbandonerFlagTweakers';
import attemptToGetOrCreateGuild from './attemptToGetOrCreateGuild';
import getGuildByDiscordGuildId from './getGuildByDiscordGuildId';

// NOTE: This branch cannot be reached from a slash command on a guild, so we don't really care about its performance.
async function attemptToCreateOrGetAndUpdateAbandonedGuild(guildId: Guild['id']): Promise<R> {
  const guildIdAsBigInt = BigInt(guildId);

  try {
    const maybeExistingGuildInDB = await prisma.guild.findUnique({
      where: { discordGuildId: guildIdAsBigInt },
      select: { isAbandoner: true }
    });

    if (maybeExistingGuildInDB !== null) {
      await justAttemptToTurnOnIsAbandonerFlag(maybeExistingGuildInDB, guildId);
      const maybeUpdatedExistingGuildInDB = await getGuildByDiscordGuildId(guildId);

      if (maybeUpdatedExistingGuildInDB === null) return null;
      return { guild: maybeUpdatedExistingGuildInDB };
    }

    const JITAbandonedGuild = await prisma.guild.create({
      data: {
        isAbandonerSince: toUTC(new Date()),
        discordGuildId: guildIdAsBigInt,
        isAbandoner: true
      }
    });

    return { guild: JITAbandonedGuild };
  } catch (error) {
    traceError(error);
    return null;
  }
}

async function JITGetOrCreateGuild(guildId: Guild['id'], callContext: CallContext = {}): Promise<R> {
  const maybeNotAbandonedGuild = await lazilyFetchGuildWithAutowiredClient(guildId);

  if (maybeNotAbandonedGuild !== null) return attemptToGetOrCreateGuild(maybeNotAbandonedGuild, callContext);

  return attemptToCreateOrGetAndUpdateAbandonedGuild(guildId);
}

async function JITGuildCreate(guildId: Guild['id'], callContext: CallContext = {}): Promise<MaybeNull<DbEntryGuild>> {
  let x: R = null;

  try {
    await verrou
      .use('redis')
      .createLock(verrouKeysFactory.JITGuildCreate(guildId), '10s')
      .run(async () => (x = await JITGetOrCreateGuild(guildId, callContext)));

    if (x === null) return null;
    return (x as NotNull<R>).guild;
  } catch {
    return null;
  }
}

export default JITGuildCreate;

export type CallContext = Partial<{
  fromAttemptToTurnOffIsAbandonerFlag: boolean;
  fromGuildCreateCallback: boolean;
}>;

type R = MaybeNull<Pick<GuildWithIsNewTag, 'guild'>>;
