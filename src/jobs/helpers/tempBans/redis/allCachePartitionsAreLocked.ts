import { getTempBanCounterLockedState } from '../../rateLimit/facades/throttling/tempBans';
import getCacheKeys from './lowLevelRedisHell/getCacheKeys';
import { EIsLockedCounter } from '../../rateLimit/enums';

async function allCachePartitionsAreLocked() {
  const guildIds = await getCacheKeys();

  for (const guildId of guildIds) {
    const isUnlocked = (await getTempBanCounterLockedState(guildId)) === EIsLockedCounter.UNLOCKED;
    if (isUnlocked) return false;
  }

  return true;
}

export default allCachePartitionsAreLocked;
