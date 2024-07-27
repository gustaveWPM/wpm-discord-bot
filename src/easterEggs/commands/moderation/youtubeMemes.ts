import type { MaybeObjectValue } from '@wpm-discord-bot/shared-types/Utils';
import type { EmptyString } from '@wpm-discord-bot/shared-types/String';
import type { Locales } from '#𝕃/typesafe-i18n/i18n-types';

const randomYoutubeMemeLinks = {
  'en-US': ['https://youtu.be/DgqzE5M5trM', 'https://youtu.be/dQw4w9WgXcQ', 'https://youtu.be/Q16KpquGsIc'],
  fr: ['https://youtu.be/V0cwBNlTy-4?t=20', 'https://youtu.be/xa9qnLdMLic']
} as const satisfies Partial<Record<Locales, YoutubeMemeLinks>>;

export function pickRandomMeme(locale: Locales): YoutubeMemeLink | EmptyString {
  const easterEggs: MaybeObjectValue<YoutubeMemeLinks> = randomYoutubeMemeLinks[locale];
  if (easterEggs === undefined || easterEggs.length === 0) return '';
  const randomIndex = Math.floor(Math.random() * easterEggs.length);
  return easterEggs[randomIndex] ?? '';
}

type YoutubeMemeLink = string;
type YoutubeMemeLinks = YoutubeMemeLink[];
