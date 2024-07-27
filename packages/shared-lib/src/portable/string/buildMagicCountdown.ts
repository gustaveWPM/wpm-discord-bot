import type { DiscordCountdownMagic } from '@wpm-discord-bot/shared-types/String';
import type { TimestampInMs } from '@wpm-discord-bot/shared-types/Number';

export const buildMagicCountDownTimestamp = (date: Date): TimestampInMs => Math.floor(date.getTime() / 1e3);

export const buildMagicCountdownFromCountdownStringTimestamp = (timestamp: TimestampInMs): DiscordCountdownMagic => `<t:${timestamp}:R>`;
