import type { GuildMember, Guild, Role } from 'discord.js';

import isRoleHigherThanOther from '@wpm-discord-bot/shared-lib/discordjs/isRoleHigherThanOther';
import isEveryoneRole from '@wpm-discord-bot/shared-lib/discordjs/isEveryoneRole';

import { EVanityConfigMisusages } from '../enums';

function isAuthorizedToPointToThisRole({
  targetedRole,
  callerMember,
  botMember,
  guildId,
  guild
}: {
  callerMember: GuildMember;
  botMember: GuildMember;
  guildId: Guild['id'];
  targetedRole: Role;
  guild: Guild;
}): EVanityConfigMisusages {
  if (isEveryoneRole(targetedRole.id, guildId)) {
    return EVanityConfigMisusages.IsEveryoneRole;
  }

  if (isRoleHigherThanOther(targetedRole, botMember.roles.highest)) {
    return EVanityConfigMisusages.BotNotAuthorizedToGiveThisRole;
  }

  if (callerMember.id === guild.ownerId) {
    return EVanityConfigMisusages.OK;
  }

  if (isRoleHigherThanOther(targetedRole, callerMember.roles.highest)) {
    return EVanityConfigMisusages.MemberNotAuthorizedToGiveThisRole;
  }

  return EVanityConfigMisusages.OK;
}

export default isAuthorizedToPointToThisRole;
