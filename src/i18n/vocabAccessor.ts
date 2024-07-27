import type { Locales } from './typesafe-i18n/i18n-types';

import L from './typesafe-i18n/i18n-node';
import { getCurrentLocale } from './ctx';

export const vocabAccessor = (locale: Locales = getCurrentLocale()) => L[locale];
