import { beforeAll, describe, expect, test } from 'bun:test';

import type { Locales } from '../i18n-types';

import { loadAllLocalesAsync } from '../i18n-util.async';
import { vocabAccessor } from '../../vocabAccessor';
import { locales } from '../i18n-util';

const needle = '__TEST_NEEDLE__';

const scope = (locale: Locales) => vocabAccessor(locale).embeds.kickCommand;

describe('I18n interpolators (embeds > kickCommand)', () => {
  beforeAll(async () => await loadAllLocalesAsync());

  test('kicksAmountOverLimit', () => {
    for (const locale of locales) {
      const item = scope(locale).kicksAmountOverLimit({ limit: needle });

      expect(item.includes(needle)).toBe(true);
    }
  });

  test('kicksAmount', () => {
    for (const locale of locales) {
      const item = scope(locale).kicksAmount({ kicksAmount: needle });

      expect(item.includes(needle)).toBe(true);
    }
  });

  test('kicksAmount > 0', () => {
    const items: string[] = [];
    for (const locale of locales) {
      items.push(scope(locale).kicksAmount({ kicksAmount: 0 }));
    }

    expect(items).toMatchSnapshot();
  });

  test('kicksAmount > singular', () => {
    const items: string[] = [];
    for (const locale of locales) {
      items.push(scope(locale).kicksAmount({ kicksAmount: 1 }));
    }

    expect(items).toMatchSnapshot();
  });

  test('kicksAmount > plural', () => {
    const items: string[] = [];
    for (const locale of locales) {
      items.push(scope(locale).kicksAmount({ kicksAmount: 2 }));
    }

    expect(items).toMatchSnapshot();
  });
});
