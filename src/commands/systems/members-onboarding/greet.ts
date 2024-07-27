import type { SlashCommandRequiredOptionsConfig, DefaultMemberPermissions } from '@wpm-discord-bot/shared-types/SlashCommand';
import type { SlashCommandI18nDictIdentifier } from '@wpm-discord-bot/shared-types/BotI18n';
import type { ABSOLUTE_BASE_LOCALE_OBJ } from '#𝕃/config';

import createI18nSlashCommandSubcommand from '#@/helpers/interactions/builders/functions/createI18nSlashCommandSubcommand';
import createI18nSlashCommandOption from '#@/helpers/interactions/builders/functions/createI18nSlashCommandOption';
import createI18nSlashCommand from '#@/helpers/interactions/builders/functions/createI18nSlashCommand';
import { GUILD_CHANNELS_WITH_TEXT_CHAT } from '@wpm-discord-bot/shared-specs/Discord';
import { uniqueArray } from '@wpm-discord-bot/shared-lib/portable/array/unique';
import { ApplicationCommandOptionType, ChannelType } from 'discord.js';

import { greetCommandCallback } from './greetCallback';

const id = 'greet' as const satisfies SlashCommandI18nDictIdentifier;
export const toggleSubcommandId = `${id}-toggle` as const satisfies SlashCommandI18nDictIdentifier;
const infosSubcommandId = `${id}-infos` as const satisfies SlashCommandI18nDictIdentifier;

export const greetToggleRequiredOptionsConfig = {
  channel: false
} as const satisfies SlashCommandRequiredOptionsConfig<typeof toggleSubcommandId>;

const toggleSubcommandOptions = [
  createI18nSlashCommandOption({ id: toggleSubcommandId, optionKey: 'channel' }, { type: ApplicationCommandOptionType.Channel })
    .setRequired(greetToggleRequiredOptionsConfig.channel)
    .addChannelTypes(
      uniqueArray([ChannelType.AnnouncementThread, ChannelType.PublicThread, ChannelType.PrivateThread, ...GUILD_CHANNELS_WITH_TEXT_CHAT] as const)
    )
];

const subcommands = [
  createI18nSlashCommandSubcommand(toggleSubcommandId, { commandOptions: toggleSubcommandOptions }),
  createI18nSlashCommandSubcommand(infosSubcommandId)
];

const greetCommand = createI18nSlashCommand(id, greetCommandCallback, {
  permissions: {
    defaultMemberPermissionsUsingANDGate: new Set(['ManageGuild'] as const satisfies DefaultMemberPermissions[]),
    isUsableInDM: false,
    isPremium: false
  },

  subcommands
});

export default greetCommand;

export type GreetCommandSubcommandsId =
  | (typeof ABSOLUTE_BASE_LOCALE_OBJ)['slashCommands'][typeof toggleSubcommandId]['name']
  | (typeof ABSOLUTE_BASE_LOCALE_OBJ)['slashCommands'][typeof infosSubcommandId]['name'];
