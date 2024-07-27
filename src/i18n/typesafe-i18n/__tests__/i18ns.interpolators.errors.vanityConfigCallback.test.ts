import { beforeAll, describe, expect, test } from 'bun:test';

import type { Locales } from '../i18n-types';

import { loadAllLocalesAsync } from '../i18n-util.async';
import { vocabAccessor } from '../../vocabAccessor';
import { locales } from '../i18n-util';

const needle = '__TEST_NEEDLE__';

const scope = (locale: Locales) => vocabAccessor(locale).errors.vanityConfigCallback;

describe('I18n interpolators (errors > vanityConfigCallback)', () => {
  beforeAll(async () => await loadAllLocalesAsync());

  test('followUpFeedback > botIsMissingPermissions', () => {
    for (const locale of locales) {
      const item = scope(locale).followUpFeedback.botIsMissingPermissions({
        roleIdMagicString: needle
      });

      expect(item.includes(needle)).toBe(true);
    }
  });

  test('followUpFeedback > botIsMissingPermissions', () => {
    for (const locale of locales) {
      const item = scope(locale).followUpFeedback.targetedRoleIsEveryone({
        everyoneRoleIdMagicString: needle
      });

      expect(item.includes(needle)).toBe(true);
    }
  });

  test('followUpFeedback > youCantGiveThisRole', () => {
    for (const locale of locales) {
      const item = scope(locale).followUpFeedback.youCantGiveThisRole({
        roleIdMagicString: needle
      });

      expect(item.includes(needle)).toBe(true);
    }
  });
});
