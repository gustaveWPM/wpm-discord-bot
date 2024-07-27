import type { Interaction, Guild } from 'discord.js';

import { redisBusDriver, redisDriver } from 'bentocache/drivers/redis';
import { redisClient, port, host } from '#@/config/redis';
import { memoryDriver } from 'bentocache/drivers/memory';
import { BentoCache, bentostore } from 'bentocache';

// NOTE: The different options are kinda "Mixed up", which can lead to some confusion. This connection constant is for the Redis Bus options of Bentocache.
// https://github.com/Julien-R44/bentocache/issues/29#issuecomment-2192830296
const connection = { port, host };

export const DISCORD_BOT_ID_KEY = 'discord-bot-id';

export const bentocacheKeysFactory = {
  vanityConfigInteractionAssociatedRole: (interactionId: Interaction['id']) =>
    `vanity:config-interaction-associated-role:interactionId:${interactionId}`,
  guildHotReloadedRecently: (guildId: Guild['id']) => `guild:resumed-recently:guildId:${guildId}`,
  guildPremium: (guildId: Guild['id']) => `guild:premium:guildId:${guildId}`,
  vanityConfig: (guildId: Guild['id']) => `vanity-config:guildId:${guildId}`,
  guildLang: (guildId: Guild['id']) => `guild:lang:guildId:${guildId}`
};

const bentocache = new BentoCache({
  stores: {
    multitier: bentostore()
      .useL1Layer(memoryDriver({ maxSize: 1_073_741_824 })) // NOTE: 1G
      .useL2Layer(redisDriver({ connection: redisClient }))
      .useBus(redisBusDriver({ connection }))
  },

  gracePeriod: { fallbackDuration: '5m', duration: '6h', enabled: true },
  default: 'multitier',
  ttl: '10m'
});

export default bentocache;
