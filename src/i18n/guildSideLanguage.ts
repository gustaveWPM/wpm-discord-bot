import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { Guild } from 'discord.js';

import tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy from '#@/db/dsl/jit/tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy';
import fromPrismaToTypesafeI18nLocales from '@wpm-discord-bot/shared-lib/portable/prisma/fromPrismaToTypesafeI18nLocales';
import bentocache, { bentocacheKeysFactory } from '#@/config/bentocache';
import traceError from '#@/helpers/interactions/traceError';
import prisma from '#@/db/prisma';

import type { Locales } from './typesafe-i18n/i18n-types';

const guildLangKeysFactory = bentocacheKeysFactory.guildLang;

const bentoFactoryOptions = { ttl: '6h' } as const;

export async function attemptToSetGuildSideLanguage(guildId: Guild['id'], lang: Locales) {
  try {
    await bentocache.use('multitier').delete(bentocacheKeysFactory.guildLang(guildId));
    await bentocache.use('multitier').getOrSet(bentocacheKeysFactory.guildLang(guildId), () => lang, bentoFactoryOptions);
  } catch (error) {
    traceError(error);
  }
}

async function getGuildSideLanguage(guildId: MaybeNull<Guild['id']>): Promise<MaybeNull<Locales>> {
  if (guildId === null) return null;

  async function getMaybeCachedLocale(guildId: Guild['id']): Promise<MaybeNull<Locales>> {
    try {
      return await bentocache.use('multitier').getOrSet(
        guildLangKeysFactory(guildId),
        async () => {
          const maybeLocale = await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy({
            cb: async () => await prisma.guild.findUnique({ where: { discordGuildId: BigInt(guildId) }, select: { lang: true } }),

            guildId
          });

          // NOTE: Triggering #returnGracedValueOrThrow -> https://github.com/Julien-R44/bentocache/blob/main/packages/bentocache/src/cache/get_set_handler.ts#L182
          if (maybeLocale === null) throw new Error(':(');
          return fromPrismaToTypesafeI18nLocales(maybeLocale.lang);
        },

        bentoFactoryOptions
      );
    } catch {
      return null;
    }
  }

  const maybeCachedLocale = await getMaybeCachedLocale(guildId);

  const maybeLocale = maybeCachedLocale === undefined ? null : (maybeCachedLocale as Locales);

  return maybeLocale;
}

export default getGuildSideLanguage;
