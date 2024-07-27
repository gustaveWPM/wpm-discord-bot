import type { MaybeUndefined, MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { GuildMember, Guild, User } from 'discord.js';

async function attemptToFetchGuildMember(guild: Guild, targetUserId: User['id']): Promise<MaybeNull<GuildMember>> {
  try {
    const guildMember: GuildMember = await guild.members.fetch(targetUserId);
    return guildMember;
  } catch {}

  return null;
}

// eslint-disable-next-line require-await
async function lazilyFetchGuildMember(guild: Guild, targetUserId: User['id']): Promise<MaybeNull<GuildMember>> {
  const maybeCachedMember: MaybeUndefined<GuildMember> = guild.members.cache.get(targetUserId);

  if (maybeCachedMember !== undefined) return maybeCachedMember;
  return attemptToFetchGuildMember(guild, targetUserId);
}

export default lazilyFetchGuildMember;
