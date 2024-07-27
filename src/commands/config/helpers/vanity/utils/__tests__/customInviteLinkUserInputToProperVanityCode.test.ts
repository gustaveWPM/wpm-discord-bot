import { CUSTOM_INVITE_LINK_MAX_LEN } from '@wpm-discord-bot/shared-specs/Discord';
import shorten from '@wpm-discord-bot/shared-lib/portable/string/shorten';
import { describe, expect, it } from 'bun:test';

import customInviteLinkUserInputToProperVanityCode, { PREFIXES as prefixes } from '../customInviteLinkUserInputToProperVanityCode';

describe('customInviteLinkUserInputToProperVanityCode', () => {
  it('should extract, given valid input (alpha chars, lowercase)', () => {
    const expected = 'example';

    for (const p of prefixes) {
      const extractedNeedle = customInviteLinkUserInputToProperVanityCode(p + expected);
      expect(extractedNeedle).toBe(expected);
    }
  });

  it('should extract, given valid input (alpha chars, uppercase)', () => {
    const expected = 'EXAMPLE';

    for (const p of prefixes) {
      const extractedNeedle = customInviteLinkUserInputToProperVanityCode(p + expected);
      expect(extractedNeedle).toBe(expected);
    }
  });

  it('should extract, given valid input (alphanum chars, all mixed up)', () => {
    const expected = shorten('V4nI7y-AaZz-0123456789' + '-'.repeat(CUSTOM_INVITE_LINK_MAX_LEN), CUSTOM_INVITE_LINK_MAX_LEN, '-');

    for (const p of prefixes) {
      const extractedNeedle = customInviteLinkUserInputToProperVanityCode(p + expected);
      expect(extractedNeedle).toBe(expected);
    }
  });

  it('should return null, given invalid inputs', () => {
    const urls = [
      'https://discord.gg/example/extra',
      'discord.gg/example/extra',

      '.gg/example/extra',
      'gg/example/extra',

      '/example/extra',
      '/example/',
      'example/',

      'https://discord.gg/exam_ple',

      'discord.gg/exam!ple',
      '.gg/exam&ple',
      '/exa$mple',
      'exam*ple',

      '0'.repeat(Math.max(...prefixes.map((PREFIX) => PREFIX.length)) + CUSTOM_INVITE_LINK_MAX_LEN + 1),
      '0'.repeat(CUSTOM_INVITE_LINK_MAX_LEN + 1),
      ''
    ];

    for (const url of urls) {
      const extractedNeedle = customInviteLinkUserInputToProperVanityCode(url);
      expect(extractedNeedle).toBe(null);
    }
  });
});
