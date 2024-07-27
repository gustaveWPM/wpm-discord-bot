import type { TimestampInMs, MsValue } from '@wpm-discord-bot/shared-types/Number';
import type { DiscordCountdownMagic } from '@wpm-discord-bot/shared-types/String';

import { buildMagicCountdownFromCountdownStringTimestamp, buildMagicCountDownTimestamp } from '../string/buildMagicCountdown';
import toUTC from './toUTC';

function getUntilDateUtcAndDiscordMagicTimestampAndMagicCountdown(parsedTime: MsValue): [Date, TimestampInMs, DiscordCountdownMagic] {
  const currentDateWithUnpredictableTZ = new Date();
  const untilDateWithUnpredictableTZ = new Date(currentDateWithUnpredictableTZ.getTime() + parsedTime);
  const untilUTC = toUTC(untilDateWithUnpredictableTZ);

  const discordMagicTimestamp = buildMagicCountDownTimestamp(untilDateWithUnpredictableTZ);
  const magicCountdown = buildMagicCountdownFromCountdownStringTimestamp(discordMagicTimestamp);

  return [untilUTC, discordMagicTimestamp, magicCountdown] as const;
}

export default getUntilDateUtcAndDiscordMagicTimestampAndMagicCountdown;
