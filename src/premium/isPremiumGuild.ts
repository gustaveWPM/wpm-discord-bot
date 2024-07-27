import type { IsPremiumMetadatas, IsPremium } from '@wpm-discord-bot/shared-types/Boolean';
import type { Guild } from 'discord.js';

import bentocache, { bentocacheKeysFactory } from '#@/config/bentocache';
import toUTC from '@wpm-discord-bot/shared-lib/portable/date/toUTC';
import traceError from '#@/helpers/interactions/traceError';
import prisma from '#@/db/prisma';

// {ToDo} INVALIDATE Cache WITH delete via in-memory /activate-premium API endpoint, and inject new value ad-hoc WITH getOrSet

const guildPremiumKeysFactory = bentocacheKeysFactory.guildPremium;

async function attemptToGetPremiumState(guildId: Guild['id']): Promise<IsPremiumMetadatas> {
  const fallback = { isPremiumUntil: null, isPremium: false } as const satisfies IsPremiumMetadatas;

  try {
    return await bentocache.use('multitier').getOrSet(
      guildPremiumKeysFactory(guildId),
      async (): Promise<IsPremiumMetadatas> => {
        const maybeDbEntry = await prisma.guild.findUnique({ where: { discordGuildId: BigInt(guildId) }, select: { isPremiumUntil: true } });

        if (maybeDbEntry === null) return fallback;

        const { isPremiumUntil } = maybeDbEntry;
        const isPremium = isPremiumUntil > toUTC(new Date());
        return { isPremiumUntil, isPremium };
      },
      { gracePeriod: { enabled: false }, ttl: '6h' }
    );
  } catch (error) {
    traceError(error, { from: attemptToGetPremiumState.name, args: { guildId } });
    return fallback;
  }
}

async function isPremiumGuild(guildId: Guild['id']): Promise<IsPremium> {
  const cachedPremiumMetadatas = await attemptToGetPremiumState(guildId);

  if (cachedPremiumMetadatas.isPremiumUntil === null) return false;

  if (cachedPremiumMetadatas.isPremium && new Date(cachedPremiumMetadatas.isPremiumUntil) > toUTC(new Date())) {
    return true;
  }

  return false;
}

export async function attemptToForceToRecomputeIsPremium(guildId: Guild['id']): Promise<void> {
  try {
    await bentocache.use('multitier').delete(guildPremiumKeysFactory(guildId));
    isPremiumGuild(guildId);
  } catch (error) {
    traceError(error, { from: attemptToForceToRecomputeIsPremium.name, args: { guildId } });
  }
}

export default isPremiumGuild;
