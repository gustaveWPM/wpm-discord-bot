import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { ELang, Guild } from '@prisma/client';
import type { Locale } from 'discord.js';

import fromTypesafeI18nToPrismaLocales from '@wpm-discord-bot/shared-lib/portable/prisma/fromTypesafeI18nToPrismaLocales';
import traceError from '#@/helpers/interactions/traceError';
import inferNearestLocale from '#𝕃/inferNearestLocale';
import prisma from '#@/db/prisma';

async function createGuild(guildId: Guild['id'], preferredLocale: Locale): Promise<MaybeNull<Guild>> {
  try {
    const inferedGuildLocale = inferNearestLocale(preferredLocale);
    const guildIdAsBigInt = BigInt(guildId);

    const newGuild = await prisma.guild.create({
      data: {
        discordGuildId: guildIdAsBigInt,
        ...(inferedGuildLocale ? { lang: fromTypesafeI18nToPrismaLocales(inferedGuildLocale) satisfies ELang } : {})
      }
    });

    return newGuild;
  } catch (error) {
    traceError(error, { ctx: { preferredLocale }, from: createGuild.name, args: { guildId } });
    return null;
  }
}

export default createGuild;
