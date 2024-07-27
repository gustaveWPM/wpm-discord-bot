import { beforeAll, describe, expect, test } from 'bun:test';

import type { Locales } from '../i18n-types';

import { loadAllLocalesAsync } from '../i18n-util.async';
import { vocabAccessor } from '../../vocabAccessor';
import { locales } from '../i18n-util';

const needleA = '__TEST_NEEDLE_A__';
const needleB = '__TEST_NEEDLE_B__';

const scope = (locale: Locales) => vocabAccessor(locale).infos.vanityConfigCallback;

describe('I18n interpolators (infos > vanityConfigCallback)', () => {
  beforeAll(async () => await loadAllLocalesAsync());

  test('followUpFeedback > successfullyConfiguredVanity', () => {
    for (const locale of locales) {
      const item = scope(locale).followUpFeedback.successfullyConfiguredVanity({
        roleIdMagicString: needleA,
        vanityCode: needleB
      });

      expect(item.includes(needleA)).toBe(true);
      expect(item.includes(needleB)).toBe(true);
    }
  });
});
