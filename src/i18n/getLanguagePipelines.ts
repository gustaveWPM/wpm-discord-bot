import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { Guild, User } from 'discord.js';

import type { Locales } from './typesafe-i18n/i18n-types';

import getGuildSideLanguage from './guildSideLanguage';
import getDmSideLanguage from './getDmSideLanguage';
import { absoluteBaseLocale } from './config';

export const attemptToGetLanguageGuildSide = async (guildId: MaybeNull<Guild['id']>): Promise<Locales> =>
  (await getGuildSideLanguage(guildId)) ?? absoluteBaseLocale;

export const attemptToGetLanguageGuildSideOrDmSide = async ({
  guildId,
  userId
}: {
  guildId: MaybeNull<Guild['id']>;
  userId: MaybeNull<User['id']>;
}): Promise<Locales> => (await getGuildSideLanguage(guildId)) ?? (await getDmSideLanguage(userId)) ?? absoluteBaseLocale;

export const attemptToGetLanguageDmSideOrGuildSide = async ({
  guildId,
  userId
}: {
  guildId: MaybeNull<Guild['id']>;
  userId: User['id'];
}): Promise<Locales> => (await getDmSideLanguage(userId)) ?? (await getGuildSideLanguage(guildId)) ?? absoluteBaseLocale;
