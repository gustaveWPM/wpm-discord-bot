import type { Limit } from '@wpm-discord-bot/shared-types/Number';
import type { Char } from '@wpm-discord-bot/shared-types/String';

const shorten = (s: string, limit: Limit, ellipsis: Char = '…'): string =>
  limit <= 0 ? '' : s.length > limit ? s.slice(0, limit - 1) + ellipsis : s;

export default shorten;
