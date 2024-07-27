import type { MaybeUndefined, MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { ExtendedClient } from '@wpm-discord-bot/shared-types/BotClient';
import type { Channel } from 'discord.js';

async function attemptToFetchChannel(channelId: Channel['id'], client: ExtendedClient): Promise<MaybeNull<Channel>> {
  try {
    const maybeChannel = await client.channels.fetch(channelId);
    return maybeChannel;
  } catch {}

  return null;
}

// eslint-disable-next-line require-await
async function lazilyFetchChannel(channelId: Channel['id'], client: ExtendedClient): Promise<MaybeNull<Channel>> {
  const maybeCachedChannel: MaybeUndefined<Channel> = client.channels.cache.get(channelId);

  if (maybeCachedChannel !== undefined) return maybeCachedChannel;
  return attemptToFetchChannel(channelId, client);
}

export default lazilyFetchChannel;
