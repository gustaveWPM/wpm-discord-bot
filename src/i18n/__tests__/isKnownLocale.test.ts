import { describe, expect, it } from 'bun:test';

import type { Locales } from '../typesafe-i18n/i18n-types';

import { locales } from '../typesafe-i18n/i18n-util';
import isKnownLocale from '../isKnownLocale';

const FIRST_LANG = locales[0] as Locales;

const PREFIX = '$';
let prefixAcc = PREFIX;
while (locales.includes((prefixAcc + FIRST_LANG) as any)) prefixAcc += PREFIX;
const invalidLanguage = prefixAcc + FIRST_LANG;

describe('isKnownLocale', () => {
  it('should return true for valid language flag', () => expect(isKnownLocale(FIRST_LANG)).toBe(true));

  it('should return false for an invalid language flag', () => {
    expect(isKnownLocale(invalidLanguage)).toBe(false);
  });
});
