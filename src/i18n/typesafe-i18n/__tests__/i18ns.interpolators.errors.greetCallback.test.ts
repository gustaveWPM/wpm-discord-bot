import { beforeAll, describe, expect, test } from 'bun:test';

import type { Locales } from '../i18n-types';

import { loadAllLocalesAsync } from '../i18n-util.async';
import { vocabAccessor } from '../../vocabAccessor';
import { locales } from '../i18n-util';

const needle = '__TEST_NEEDLE__';

const scope = (locale: Locales) => vocabAccessor(locale).errors.greetCallback;

describe('I18n interpolators (errors > greetCallback)', () => {
  beforeAll(async () => await loadAllLocalesAsync());

  test('followUpFeedback > usedAllYourGreetCreditsEphemeralWithFreemiumPlan', () => {
    for (const locale of locales) {
      const item = scope(locale).followUpFeedback.usedAllYourGreetCreditsEphemeralWithFreemiumPlan({
        premiumMaxGreetsAmount: needle
      });

      expect(item.includes(needle)).toBe(true);
    }
  });

  test('followUpFeedback > usedAllYourGreetCreditsEphemeralWithPremiumPlan', () => {
    for (const locale of locales) {
      const item = scope(locale).followUpFeedback.usedAllYourGreetCreditsEphemeralWithPremiumPlan({
        premiumMaxGreetsAmount: needle
      });

      expect(item.includes(needle)).toBe(true);
    }
  });

  test('followUpFeedback > botIsMissingPermissions', () => {
    for (const locale of locales) {
      const item = scope(locale).followUpFeedback.botIsMissingPermissions({
        channelIdMagicString: needle
      });

      expect(item.includes(needle)).toBe(true);
    }
  });
});
