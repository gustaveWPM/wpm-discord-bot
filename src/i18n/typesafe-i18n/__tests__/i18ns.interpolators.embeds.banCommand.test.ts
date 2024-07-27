import { beforeAll, describe, expect, test } from 'bun:test';

import type { Locales } from '../i18n-types';

import { loadAllLocalesAsync } from '../i18n-util.async';
import { vocabAccessor } from '../../vocabAccessor';
import { locales } from '../i18n-util';

const needle = '__TEST_NEEDLE__';

const scope = (locale: Locales) => vocabAccessor(locale).embeds.banCommand;

describe('I18n interpolators (embeds > banCommand)', () => {
  beforeAll(async () => await loadAllLocalesAsync());

  test('kicksAmountOverLimit', () => {
    for (const locale of locales) {
      const item = scope(locale).bansAmountOverLimit({ limit: needle });

      expect(item.includes(needle)).toBe(true);
    }
  });

  test('bansAmount', () => {
    for (const locale of locales) {
      const item = scope(locale).bansAmount({ bansAmount: needle });

      expect(item.includes(needle)).toBe(true);
    }
  });

  test('bansAmount > 0', () => {
    const items: string[] = [];
    for (const locale of locales) {
      items.push(scope(locale).bansAmount({ bansAmount: 0 }));
    }

    expect(items).toMatchSnapshot();
  });

  test('bansAmount > singular', () => {
    const items: string[] = [];
    for (const locale of locales) {
      items.push(scope(locale).bansAmount({ bansAmount: 1 }));
    }

    expect(items).toMatchSnapshot();
  });

  test('bansAmount > plural', () => {
    const items: string[] = [];
    for (const locale of locales) {
      items.push(scope(locale).bansAmount({ bansAmount: 2 }));
    }

    expect(items).toMatchSnapshot();
  });
});
