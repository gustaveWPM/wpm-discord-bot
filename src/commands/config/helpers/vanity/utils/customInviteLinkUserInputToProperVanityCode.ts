import type { CustomInviteLinkUserInput, CustomInviteLinkCode } from '@wpm-discord-bot/shared-types/String';
import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { Limit } from '@wpm-discord-bot/shared-types/Number';

import { readonlyUniqueArray } from '@wpm-discord-bot/shared-lib/portable/array/unique';
import { CUSTOM_INVITE_LINK_MAX_LEN } from '@wpm-discord-bot/shared-specs/Discord';

export const PREFIXES = readonlyUniqueArray(['https://discord.gg/', 'discord.gg/', '.gg/', 'gg/', '/', ''] as const);
const NEEDLE_PATTERN = '([A-Za-z0-9-]+)' as const;

const REGEX_PREFIXES = PREFIXES.map((PREFIX) => PREFIX.replace(/\./g, '\\.'));

const BASE_MATCHERS = REGEX_PREFIXES.map((PREFIX) => '^' + PREFIX + NEEDLE_PATTERN + '$');
// NOTE: https://github.com/oven-sh/bun/issues/12560
const REGEX_MATCHERS = BASE_MATCHERS.map((MATCHER) => new RegExp(MATCHER));

const PREFIX_MAX_LEN: Limit = Math.max(...PREFIXES.map((PREFIX) => PREFIX.length));

const M_IDX = 1;

// NOTE: lol DoS
const MAX_LEN_THRESHOLD: Limit = PREFIX_MAX_LEN + CUSTOM_INVITE_LINK_MAX_LEN;

function customInviteLinkUserInputToProperVanityCode(userInput: CustomInviteLinkUserInput): MaybeNull<CustomInviteLinkCode> {
  if (userInput.length <= 0 || MAX_LEN_THRESHOLD < userInput.length) return null;

  for (const matcher of REGEX_MATCHERS) {
    const match = userInput.match(matcher);

    if (!(match !== null && M_IDX < match.length)) continue;

    const candidate = match[M_IDX] as string;
    if (candidate.length <= CUSTOM_INVITE_LINK_MAX_LEN) return candidate;
  }

  return null;
}

export default customInviteLinkUserInputToProperVanityCode;
