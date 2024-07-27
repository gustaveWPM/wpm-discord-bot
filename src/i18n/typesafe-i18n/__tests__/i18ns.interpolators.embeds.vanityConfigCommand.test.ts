import { beforeAll, describe, expect, test } from 'bun:test';

import type { Locales } from '../i18n-types';

import { loadAllLocalesAsync } from '../i18n-util.async';
import { vocabAccessor } from '../../vocabAccessor';
import { locales } from '../i18n-util';

const needle = '__TEST_NEEDLE__';

const scope = (locale: Locales) => vocabAccessor(locale).embeds.vanityConfigCommand;

describe('I18n interpolators (embeds > vanityConfigCommand > dangerousPermsWarning > description)', () => {
  beforeAll(async () => await loadAllLocalesAsync());

  test('kicksAmountOverLimit', () => {
    for (const locale of locales) {
      const item = scope(locale).dangerousPermsWarning.description({ roleIdMagicString: needle });

      expect(item.includes(needle)).toBe(true);
    }
  });
});
