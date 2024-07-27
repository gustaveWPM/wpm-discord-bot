import type { UnpredictibleLocale } from '@wpm-discord-bot/shared-types/BotI18n';
import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';

import type { Locales } from './typesafe-i18n/i18n-types';

import { locales } from './typesafe-i18n/i18n-util';
import isKnownLocale from './isKnownLocale';

function inferNearestLocale(key: UnpredictibleLocale): MaybeNull<Locales> {
  if (!key) return null;

  const splittedLocale = key.split('-');

  const localeBase = splittedLocale[0] as string;
  if (isKnownLocale(localeBase)) return localeBase;

  const maybeNearestLocale = locales.find((locale) => locale.startsWith(localeBase)) ?? null;
  return maybeNearestLocale;
}

export default inferNearestLocale;
