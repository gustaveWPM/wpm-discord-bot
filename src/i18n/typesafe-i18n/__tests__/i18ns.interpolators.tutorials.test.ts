import { beforeAll, describe, expect, test } from 'bun:test';

import type { Locales } from '../i18n-types';

import { loadAllLocalesAsync } from '../i18n-util.async';
import { vocabAccessor } from '../../vocabAccessor';
import { locales } from '../i18n-util';

const needle = '__TEST_NEEDLE__';
const needleA = '__TEST_NEEDLE_A__';
const needleB = '__TEST_NEEDLE_B__';

const scope = (locale: Locales) => vocabAccessor(locale).tutorials;

describe('I18n interpolators (tutorials)', () => {
  beforeAll(async () => await loadAllLocalesAsync());

  test('usage > durationOption > informationEmbed > with', () => {
    for (const locale of locales) {
      const item = scope(locale).usage.durationOption.informationEmbed.with({
        userDurationInput: needle
      });

      expect(item.includes(needle)).toBe(true);
    }
  });

  test('usage > vanityConfig > informationEmbed > with', () => {
    for (const locale of locales) {
      const item = scope(locale).usage.vanityConfig.informationEmbed.with({
        vanityCode: needle
      });

      expect(item.includes(needle)).toBe(true);
    }
  });

  test('usecase', () => {
    for (const locale of locales) {
      const item = scope(locale).usecase({
        commandName: needleA,
        option: needleB
      });

      expect(item.includes(needleA)).toBe(true);
      expect(item.includes(needleB)).toBe(true);
    }
  });
});
