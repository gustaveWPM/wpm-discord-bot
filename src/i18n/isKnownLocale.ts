import type { UnpredictibleLocale } from '@wpm-discord-bot/shared-types/BotI18n';

import type { Locales } from './typesafe-i18n/i18n-types';

import { locales } from './typesafe-i18n/i18n-util';

const isKnownLocale = (value: UnpredictibleLocale): value is Locales => (locales as any).includes(value);
export default isKnownLocale;
