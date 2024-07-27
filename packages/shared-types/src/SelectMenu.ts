import type { StringSelectMenuInteraction, StringSelectMenuBuilder } from 'discord.js';

type SelectMenuDrawCallback = (interaction: StringSelectMenuInteraction) => Promise<StringSelectMenuBuilder>;

export type SelectMenu = {
  draw: SelectMenuDrawCallback;
  name: string;
};
