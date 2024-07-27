import type { Guild } from 'discord.js';

import fromTypesafeI18nToPrismaLocales from '@wpm-discord-bot/shared-lib/portable/prisma/fromTypesafeI18nToPrismaLocales';
import fromPrismaToTypesafeI18nLocales from '@wpm-discord-bot/shared-lib/portable/prisma/fromPrismaToTypesafeI18nLocales';
import prisma from '#@/db/prisma';

import type { Locales } from './typesafe-i18n/i18n-types';

import { attemptToSetGuildSideLanguage } from './guildSideLanguage';
import inferNearestLocale from './inferNearestLocale';
import { absoluteBaseLocale } from './config';

async function attemptToUpdateGuildLocale(guild: Guild) {
  const inferedGuildLocale: Locales = inferNearestLocale(guild.preferredLocale) ?? absoluteBaseLocale;

  const guildIdAsBigInt = BigInt(guild.id);

  await prisma.guild.update({
    data: { lang: fromTypesafeI18nToPrismaLocales(inferedGuildLocale) },
    where: { discordGuildId: guildIdAsBigInt }
  });

  const maybeGuild = await prisma.guild.findUnique({ where: { discordGuildId: guildIdAsBigInt }, select: { forcedLang: true } });

  const maybeForcedLang = maybeGuild?.forcedLang ?? null;

  if (maybeForcedLang !== null) {
    attemptToSetGuildSideLanguage(guild.id, fromPrismaToTypesafeI18nLocales(maybeForcedLang));
  } else {
    attemptToSetGuildSideLanguage(guild.id, inferedGuildLocale);
  }
}

export default attemptToUpdateGuildLocale;
