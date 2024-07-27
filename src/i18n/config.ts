import type { Locales } from './typesafe-i18n/i18n-types';

import EN_US from './typesafe-i18n/en-US';

export const absoluteBaseLocale = 'en-US' as const satisfies Locales;
export const ABSOLUTE_BASE_LOCALE_OBJ = EN_US;
