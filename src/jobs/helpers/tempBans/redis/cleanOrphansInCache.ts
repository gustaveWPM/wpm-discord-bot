import deleteCachePartition from './lowLevelRedisHell/deleteCachePartition';
import getCacheKeys from './lowLevelRedisHell/getCacheKeys';
import getSliceLength from './getSliceLength';

async function cleanOrphansInCache() {
  const guildIds = await getCacheKeys();

  const data = await Promise.all(
    guildIds.map(async (guildId) => {
      const length = await getSliceLength(guildId);
      return { guildId, length };
    })
  );

  const orphans = data.filter(({ length }) => length <= 0);
  await Promise.all(orphans.map(({ guildId }) => deleteCachePartition(guildId)));
}

export default cleanOrphansInCache;
