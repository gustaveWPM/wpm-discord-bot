import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { PermissionLabel } from '@wpm-discord-bot/shared-types/SlashCommand';

import { PermissionFlagsBits, GuildMember } from 'discord.js';

import lazilyFetchGuildMember from './lazilyFetchGuildMember';
import isRoleHigherThanOther from './isRoleHigherThanOther';

/**
 * @throws {Error}
 */
export async function tryToComputeThatMemberHasHigherPermissions(
  interaction: GuildInteraction,
  targetUserId: GuildMember['id'],
  requiredUserPermissions: readonly PermissionLabel[]
): Promise<boolean> {
  const { member: callerMember, guild } = interaction;

  if (!(callerMember instanceof GuildMember)) {
    throw new Error(`${tryToComputeThatMemberHasHigherPermissions.name}: callerMember is not a GuildMember`);
  }

  if (requiredUserPermissions.some((expectedPermission) => !callerMember.permissions.has(PermissionFlagsBits[expectedPermission]))) {
    return false;
  }

  const targetMember = await lazilyFetchGuildMember(guild, targetUserId);

  if (targetMember === null) return true;

  const { ownerId: guildOwnerId } = guild;

  if (callerMember.id === guildOwnerId) return true;
  if (targetMember.id === guildOwnerId) return false;

  return isRoleHigherThanOther(callerMember.roles.highest, targetMember.roles.highest);
}
