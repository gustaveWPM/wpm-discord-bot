import type { MaybeUndefined, Bounds } from '@wpm-discord-bot/shared-types/Utils';
import type { TimeString } from '@wpm-discord-bot/shared-types/String';
import type { MsValue } from '@wpm-discord-bot/shared-types/Number';

import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import { EParseTime } from '@wpm-discord-bot/shared-specs/EParseTime';
import { parse } from '@lukeed/ms';

function attemptToParseDurationSlashCommandOption(durationString: TimeString, bounds: Bounds): { resStatus: EParseTime; value: MsValue } {
  // NOTE: lol DoS
  if (durationString.length > BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.LIMITS.DURATION_STRING_MAX_LENGTH) {
    return { resStatus: EParseTime.IncorrectInput, value: -1 };
  }

  // NOTE: https://github.com/oven-sh/bun/issues/12560
  if (/^\d+$/.test(durationString)) return { resStatus: EParseTime.IncorrectInput, value: -1 };

  const parsedTime: MaybeUndefined<MsValue> = parse(durationString);
  if (parsedTime === undefined) return { resStatus: EParseTime.IncorrectInput, value: -1 };

  const { MIN, MAX } = bounds;
  if (!(MIN <= parsedTime && parsedTime <= MAX)) {
    return { resStatus: EParseTime.IncorrectInput, value: -1 };
  }

  return { resStatus: EParseTime.OK, value: parsedTime };
}

export default attemptToParseDurationSlashCommandOption;
