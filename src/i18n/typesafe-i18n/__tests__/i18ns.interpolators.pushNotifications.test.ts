import { beforeAll, describe, expect, test } from 'bun:test';

import type { Locales } from '../i18n-types';

import { loadAllLocalesAsync } from '../i18n-util.async';
import { vocabAccessor } from '../../vocabAccessor';
import { locales } from '../i18n-util';

const needle = '__TEST_NEEDLE__';

const scope = (locale: Locales) => vocabAccessor(locale).pushNotifications;

describe('I18n interpolators (pushNotifications)', () => {
  beforeAll(async () => await loadAllLocalesAsync());

  test('greetNotification', () => {
    for (const locale of locales) {
      const item = scope(locale).greet({
        memberIdMagicString: needle
      });

      expect(item.includes(needle)).toBe(true);
    }
  });
});
