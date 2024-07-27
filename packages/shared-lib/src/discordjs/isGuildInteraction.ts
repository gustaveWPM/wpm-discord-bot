import type { GuildInteractionInChannel, GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { ChatInputCommandInteraction } from 'discord.js';

const isGuildInteraction = (interaction: ChatInputCommandInteraction): interaction is GuildInteraction =>
  interaction.guild !== null && interaction.guildId !== null;

export const isGuildInteractionInChannel = (interaction: ChatInputCommandInteraction): interaction is GuildInteractionInChannel =>
  isGuildInteraction(interaction) && interaction.channel !== null;

export default isGuildInteraction;
