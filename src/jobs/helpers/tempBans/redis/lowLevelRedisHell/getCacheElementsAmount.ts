import type { Quantity } from '@wpm-discord-bot/shared-types/Number';

import getSliceLength from '../getSliceLength';
import getCacheKeys from './getCacheKeys';

async function getCacheElementsAmount(): Promise<Quantity> {
  const guildIds = await getCacheKeys();
  if (guildIds.length <= 0) return 0;

  const slicesLength = await Promise.all(guildIds.map((guildId) => getSliceLength(guildId)));

  const amount = slicesLength.reduce((total, sliceLength) => total + sliceLength, 0);
  return amount;
}

export default getCacheElementsAmount;
