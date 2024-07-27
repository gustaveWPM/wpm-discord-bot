import { beforeAll, describe, expect, test } from 'bun:test';

import type { Locales } from '../i18n-types';

import { loadAllLocalesAsync } from '../i18n-util.async';
import { vocabAccessor } from '../../vocabAccessor';
import { locales } from '../i18n-util';

const needle = '__TEST_NEEDLE__';
const needleA = '__TEST_NEEDLE_A__';
const needleB = '__TEST_NEEDLE_B__';

const scope = (locale: Locales) => vocabAccessor(locale).errors.muteCallback;

describe('I18n interpolators (errors > muteCallback)', () => {
  beforeAll(async () => await loadAllLocalesAsync());

  test('followUpFeedbacks > triedToMuteBot', () => {
    for (const locale of locales) {
      const item = scope(locale).followUpFeedback.triedToMuteBot({ youtubeMemeLink: needle });

      expect(item.includes(needle)).toBe(true);
    }
  });

  test('followUpFeedbacks > botIsMissingPermissions', () => {
    for (const locale of locales) {
      const item = scope(locale).followUpFeedback.botIsMissingPermissions({
        memberIdMagicString: needleB,
        guildName: needleA
      });

      expect(item.includes(needleA)).toBe(true);
      expect(item.includes(needleB)).toBe(true);
    }
  });

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

  test('followUpFeedbacks > misusages > warnings > yourMuteHasNotBeenApplied', () => {
    for (const locale of locales) {
      const item = scope(locale).followUpFeedback.misusages.warnings.yourMuteHasNotBeenApplied({
        memberIdMagicString: needleB,
        guildName: needleA
      });

      expect(item.includes(needleA)).toBe(true);
      expect(item.includes(needleB)).toBe(true);
    }
  });

  test('followUpFeedbacks > thisMemberIsAlreadyMuted', () => {
    for (const locale of locales) {
      const item = scope(locale).followUpFeedback.thisMemberIsAlreadyMuted({
        memberIdMagicString: needleB,
        guildName: needleA
      });

      expect(item.includes(needleA)).toBe(true);
      expect(item.includes(needleB)).toBe(true);
    }
  });

  test('followUpFeedbacks > youCantMuteThisMember', () => {
    for (const locale of locales) {
      const item = scope(locale).followUpFeedback.youCantMuteThisMember({
        memberIdMagicString: needleB,
        guildName: needleA
      });

      expect(item.includes(needleA)).toBe(true);
      expect(item.includes(needleB)).toBe(true);
    }
  });
});
