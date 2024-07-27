import { beforeAll, describe, expect, test } from 'bun:test';

import type { Locales } from '../i18n-types';

import { loadAllLocalesAsync } from '../i18n-util.async';
import { vocabAccessor } from '../../vocabAccessor';
import { locales } from '../i18n-util';

const needle = '__TEST_NEEDLE__';

const scope = (locale: Locales) => vocabAccessor(locale).embeds['greet-info'];

describe('I18n interpolators (embeds > greet-info)', () => {
  beforeAll(async () => await loadAllLocalesAsync());

  test('premiumAd', () => {
    for (const locale of locales) {
      const item = scope(locale).premiumAd({
        premiumMaxGreetsAmount: needle
      });

      expect(item.includes(needle)).toBe(true);
    }
  });

  test('premiumRenewal', () => {
    for (const locale of locales) {
      const item = scope(locale).premiumRenewal({
        premiumMaxGreetsAmount: needle
      });

      expect(item.includes(needle)).toBe(true);
    }
  });
});
