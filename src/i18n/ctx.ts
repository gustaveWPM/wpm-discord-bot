import type { Locales } from './typesafe-i18n/i18n-types';

import { baseLocale } from './typesafe-i18n/i18n-util';

namespace Ctx {
  export let currentLocale: Locales = baseLocale;
}

export const getCurrentLocale = () => Ctx.currentLocale;
