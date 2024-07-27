import type { MaybeUndefined, MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { Guild, Role } from 'discord.js';

export async function attemptToFetchGuildRole(guild: Guild, targetRoleId: Role['id']): Promise<MaybeNull<Role>> {
  try {
    const role = await guild.roles.fetch(targetRoleId);
    return role;
  } catch {}

  return null;
}

// eslint-disable-next-line require-await
async function lazilyFetchGuildRole(guild: Guild, targetRoleId: Role['id']): Promise<MaybeNull<Role>> {
  const maybeCachedRole: MaybeUndefined<Role> = guild.roles.cache.get(targetRoleId);

  if (maybeCachedRole !== undefined) return maybeCachedRole;
  return attemptToFetchGuildRole(guild, targetRoleId);
}

export default lazilyFetchGuildRole;
