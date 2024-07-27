import type { GuildMember, Guild, User } from 'discord.js';

import tryToLazilyFetchGuildBan from './tryToLazilyFetchGuildBan';

/**
 * @throws {DiscordAPIError}
 */
async function tryToCheckIfIsAlreadyBanned(guild: Guild, user: GuildMember | User) {
  try {
    const maybeBan = await tryToLazilyFetchGuildBan(guild, user.id);
    return maybeBan !== null;
  } catch (error) {
    throw error;
  }
}

export default tryToCheckIfIsAlreadyBanned;
