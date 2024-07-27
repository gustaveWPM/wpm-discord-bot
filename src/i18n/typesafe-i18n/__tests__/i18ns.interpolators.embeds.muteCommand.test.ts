import { beforeAll, describe, expect, test } from 'bun:test';

import type { Locales } from '../i18n-types';

import { loadAllLocalesAsync } from '../i18n-util.async';
import { vocabAccessor } from '../../vocabAccessor';
import { locales } from '../i18n-util';

const needle = '__TEST_NEEDLE__';

const scope = (locale: Locales) => vocabAccessor(locale).embeds.muteCommand;

describe('I18n interpolators (embeds > muteCommand)', () => {
  beforeAll(async () => await loadAllLocalesAsync());

  test('warnsAmountOverLimit', () => {
    for (const locale of locales) {
      const item = scope(locale).mutesAmountOverLimit({ limit: needle });

      expect(item.includes(needle)).toBe(true);
    }
  });

  test('warnsAmount', () => {
    for (const locale of locales) {
      const item = scope(locale).mutesAmount({ mutesAmount: needle });

      expect(item.includes(needle)).toBe(true);
    }
  });

  test('warnsAmount > 0', () => {
    const items: string[] = [];
    for (const locale of locales) {
      items.push(scope(locale).mutesAmount({ mutesAmount: 0 }));
    }

    expect(items).toMatchSnapshot();
  });

  test('warnsAmount > singular', () => {
    const items: string[] = [];
    for (const locale of locales) {
      items.push(scope(locale).mutesAmount({ mutesAmount: 1 }));
    }

    expect(items).toMatchSnapshot();
  });

  test('warnsAmount > plural', () => {
    const items: string[] = [];
    for (const locale of locales) {
      items.push(scope(locale).mutesAmount({ mutesAmount: 2 }));
    }

    expect(items).toMatchSnapshot();
  });
});
