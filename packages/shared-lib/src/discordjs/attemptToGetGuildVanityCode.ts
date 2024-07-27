import type { CustomInviteLinkCode } from '@wpm-discord-bot/shared-types/String';
import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { GuildMember, Guild } from 'discord.js';

async function attemptToGetGuildVanityCode(guild: Guild, botMember: GuildMember): Promise<MaybeNull<CustomInviteLinkCode>> {
  try {
    const vanityCode = botMember.permissions.has('ManageGuild') ? ((await guild.fetchVanityData()).code?.toLowerCase() ?? null) : null;

    return vanityCode;
  } catch {
    return null;
  }
}

export default attemptToGetGuildVanityCode;
