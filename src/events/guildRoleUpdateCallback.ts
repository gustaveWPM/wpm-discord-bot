import type { Role } from 'discord.js';

import attemptToMoveTempBannedMembersToTempBannedMembersMissingPerms from '#@/jobs/helpers/tempBans/db/attemptToMoveTempBannedMembersToTempBannedMembersMissingPerms';
import attemptToMoveTempBannedMembersMissingPermsToTempBannedMembers from '#@/jobs/helpers/tempBans/db/attemptToMoveTempBannedMembersMissingPermsToTempBannedMembers';
import lazilyFetchGuildMember from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchGuildMember';
import { attemptToTurnOnIsAbandonerFlag } from '#@/db/dsl/guilds/isAbandonerFlagTweakers';
import { getDiscordBotId } from '#@/client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function guildRoleUpdateCallback(_: OldRole, newRole: NewRole) {
  const discordBotId = await getDiscordBotId();
  const { guild } = newRole;
  const { id: guildId } = guild;

  const botMember = await lazilyFetchGuildMember(guild, discordBotId);

  if (botMember === null) {
    attemptToTurnOnIsAbandonerFlag(guildId);
    return;
  }

  if (botMember.permissions.has('BanMembers')) {
    attemptToMoveTempBannedMembersMissingPermsToTempBannedMembers(guild);
  } else {
    attemptToMoveTempBannedMembersToTempBannedMembersMissingPerms(guildId);
  }
}

export default guildRoleUpdateCallback;

type OldRole = Role;
type NewRole = Role;
