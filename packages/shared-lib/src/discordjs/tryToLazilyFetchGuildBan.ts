import type { MaybeUndefined, MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { GuildBan, Guild, User } from 'discord.js';

import { UNKNOWN_BAN } from '@wpm-discord-bot/shared-specs/Discord';

/**
 * @throws {DiscordAPIError}
 */
export async function tryToFetchGuildBan(guild: Guild, targetUserId: User['id']): Promise<MaybeNull<GuildBan>> {
  try {
    const guildBan: GuildBan = await guild.bans.fetch(targetUserId);
    return guildBan;
  } catch (error) {
    if (typeof error === 'object' && (error as any).code === UNKNOWN_BAN) {
      return null;
    }

    throw error;
  }
}

/**
 * @throws {DiscordAPIError}
 * CASCADE
 */
// eslint-disable-next-line require-await
async function tryToLazilyFetchGuildBan(guild: Guild, targetUserId: User['id']): Promise<MaybeNull<GuildBan>> {
  const cachedGuildBan: MaybeUndefined<GuildBan> = guild.bans.cache.get(targetUserId);

  if (cachedGuildBan !== undefined) return cachedGuildBan;
  return await tryToFetchGuildBan(guild, targetUserId);
}

export default tryToLazilyFetchGuildBan;
