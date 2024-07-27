import { beforeAll, describe, expect, test } from 'bun:test';

import type { Locales } from '../i18n-types';

import { loadAllLocalesAsync } from '../i18n-util.async';
import { vocabAccessor } from '../../vocabAccessor';
import { locales } from '../i18n-util';

const needle = '__TEST_NEEDLE__';
const needleA = '__TEST_NEEDLE_A__';
const needleB = '__TEST_NEEDLE_B__';

const scope = (locale: Locales) => vocabAccessor(locale).errors.kickCallback;

describe('I18n interpolators (errors > kickCallback)', () => {
  beforeAll(async () => await loadAllLocalesAsync());

  test('followUpFeedback > failedToInteract', () => {
    for (const locale of locales) {
      const item = scope(locale).followUpFeedback.failedToInteract({
        memberIdMagicString: needleB,
        guildName: needleA
      });

      expect(item.includes(needleA)).toBe(true);
      expect(item.includes(needleB)).toBe(true);
    }
  });

  test('followUpFeedback > botIsMissingPermissions', () => {
    for (const locale of locales) {
      const item = scope(locale).followUpFeedback.botIsMissingPermissions({
        memberIdMagicString: needleB,
        guildName: needleA
      });

      expect(item.includes(needleA)).toBe(true);
      expect(item.includes(needleB)).toBe(true);
    }
  });

  test('followUpFeedback > triedToKickBot', () => {
    for (const locale of locales) {
      const item = scope(locale).followUpFeedback.triedToKickBot({
        youtubeMemeLink: needle
      });

      expect(item.includes(needle)).toBe(true);
    }
  });
});
