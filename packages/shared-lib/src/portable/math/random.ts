import type { Integer } from '@wpm-discord-bot/shared-types/Number';

function random(min: number, max: number): Integer {
  if (min === max) return min;
  if (max < min) [min, max] = [max, min];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default random;
