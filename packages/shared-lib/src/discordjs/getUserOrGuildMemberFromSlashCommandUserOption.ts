import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { GuildMember, User } from 'discord.js';

import lazilyFetchGuildMember from './lazilyFetchGuildMember';

async function getUserOrGuildMemberFromSlashCommandUserOption(interaction: GuildInteraction, commandTargetUser: User): Promise<GuildMember | User> {
  const guildMember = await lazilyFetchGuildMember(interaction.guild, commandTargetUser.id);
  const memberIsNotInTheGuild = guildMember === null;
  const typedTargetMember: GuildMember | User = memberIsNotInTheGuild ? commandTargetUser : guildMember;

  return typedTargetMember;
}

export default getUserOrGuildMemberFromSlashCommandUserOption;
