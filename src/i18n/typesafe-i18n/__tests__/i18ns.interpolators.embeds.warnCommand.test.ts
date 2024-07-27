import { beforeAll, describe, expect, test } from 'bun:test';

import type { Locales } from '../i18n-types';

import { loadAllLocalesAsync } from '../i18n-util.async';
import { vocabAccessor } from '../../vocabAccessor';
import { locales } from '../i18n-util';

const needle = '__TEST_NEEDLE__';

const scope = (locale: Locales) => vocabAccessor(locale).embeds.warnCommand;

describe('I18n interpolators (embeds > warnCommand)', () => {
  beforeAll(async () => await loadAllLocalesAsync());

  test('warnsAmountOverLimit', () => {
    for (const locale of locales) {
      const item = scope(locale).warnsAmountOverLimit({ limit: needle });

      expect(item.includes(needle)).toBe(true);
    }
  });

  test('warnsAmount', () => {
    for (const locale of locales) {
      const item = scope(locale).warnsAmount({ warnsAmount: needle });

      expect(item.includes(needle)).toBe(true);
    }
  });

  test('warnsAmount > 0', () => {
    const items: string[] = [];
    for (const locale of locales) {
      items.push(scope(locale).warnsAmount({ warnsAmount: 0 }));
    }

    expect(items).toMatchSnapshot();
  });

  test('warnsAmount > singular', () => {
    const items: string[] = [];
    for (const locale of locales) {
      items.push(scope(locale).warnsAmount({ warnsAmount: 1 }));
    }

    expect(items).toMatchSnapshot();
  });

  test('warnsAmount > plural', () => {
    const items: string[] = [];
    for (const locale of locales) {
      items.push(scope(locale).warnsAmount({ warnsAmount: 2 }));
    }

    expect(items).toMatchSnapshot();
  });
});
