import { beforeAll, describe, expect, test } from 'bun:test';

import type { Locales } from '../i18n-types';

import { loadAllLocalesAsync } from '../i18n-util.async';
import { vocabAccessor } from '../../vocabAccessor';
import { locales } from '../i18n-util';

const needle = '__TEST_NEEDLE__';

const scope = (locale: Locales) => vocabAccessor(locale).infos.greetCallback.followUpFeedback;

describe('I18n interpolators (infos > greetCallback > followUpFeedback)', () => {
  beforeAll(async () => await loadAllLocalesAsync());

  test('greetAdded', () => {
    for (const locale of locales) {
      const item = scope(locale).greetAdded({
        channelIdMagicString: needle
      });

      expect(item.includes(needle)).toBe(true);
    }
  });

  test('greetRemoved', () => {
    for (const locale of locales) {
      const item = scope(locale).greetRemoved({
        channelIdMagicString: needle
      });

      expect(item.includes(needle)).toBe(true);
    }
  });
});
