import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { ChatInputCommandInteraction } from 'discord.js';

import { GuildMember } from 'discord.js';

import isGuildInteraction from './isGuildInteraction';

function buildGuildInteractionFromGuildMemberToAnotherGuildMember(
  interaction: ChatInputCommandInteraction
): Partial<{ guildInteraction: GuildInteraction; callerMember: GuildMember }> {
  if (!isGuildInteraction(interaction)) {
    return {};
  }

  const { member: callerMember } = interaction;

  if (!(callerMember instanceof GuildMember)) {
    return {};
  }

  return { guildInteraction: interaction, callerMember };
}

export default buildGuildInteractionFromGuildMemberToAnotherGuildMember;
