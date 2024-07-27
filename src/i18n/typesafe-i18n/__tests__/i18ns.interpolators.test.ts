import { beforeAll, describe, expect, test } from 'bun:test';

import { loadAllLocalesAsync } from '../i18n-util.async';
import { vocabAccessor } from '../../vocabAccessor';
import { locales } from '../i18n-util';

const needle = '__TEST_NEEDLE__';
const needleA = '__TEST_NEEDLE_A__';
const needleB = '__TEST_NEEDLE_B__';

describe('I18n interpolators (Misc)', () => {
  beforeAll(async () => await loadAllLocalesAsync());

  test('initializers > botUserTag', () => {
    for (const locale of locales) {
      const item = vocabAccessor(locale).initializers.botIsReady({ botUserTag: needleA, PMID: needleB });

      expect(item.includes(needleA)).toBe(true);
      expect(item.includes(needleB)).toBe(true);
    }
  });

  test('muteCommandEmbed > until', () => {
    for (const locale of locales) {
      const item = vocabAccessor(locale).embeds.muteCommand.until({ countdownMagicString: needle });

      expect(item.includes(needle)).toBe(true);
    }
  });

  test('etc > fragments > separatedWithDoubleColumns', () => {
    for (const locale of locales) {
      const item = vocabAccessor(locale).etc.fragments.separatedWithDoubleColumns({ prefix: needleA, suffix: needleB });

      expect(item.includes(needleA)).toBe(true);
      expect(item.includes(needleB)).toBe(true);
    }
  });
});
