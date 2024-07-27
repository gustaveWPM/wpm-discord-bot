import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { PermissionLabel } from '@wpm-discord-bot/shared-types/SlashCommand';
import type { GuildMember } from 'discord.js';

import { PermissionFlagsBits } from 'discord.js';

import lazilyFetchGuildMember from './lazilyFetchGuildMember';
import isRoleHigherThanOther from './isRoleHigherThanOther';

/**
 * @throws {Error}
 */
export async function tryToComputeThatBotHasHigherPermissions(
  interaction: GuildInteraction,
  targetUserId: GuildMember['id'],
  requiredBotPermissions: readonly PermissionLabel[]
): Promise<boolean> {
  const { client, guild } = interaction;

  const botMember = await lazilyFetchGuildMember(guild, client.user.id);

  if (botMember === null) {
    throw new Error(`${tryToComputeThatBotHasHigherPermissions.name}: botMember is not a GuildMember`);
  }

  if (requiredBotPermissions.some((expectedPermission) => !botMember.permissions.has(PermissionFlagsBits[expectedPermission]))) {
    return false;
  }

  const targetMember = await lazilyFetchGuildMember(guild, targetUserId);

  if (targetMember === null) return true;

  const { ownerId: guildOwnerId } = guild;

  if (botMember.id === guildOwnerId) return true;
  if (targetMember.id === guildOwnerId) return false;

  return isRoleHigherThanOther(botMember.roles.highest, targetMember.roles.highest);
}
