import type { SlashCommandRequiredOptionsConfig, DefaultMemberPermissions } from '@wpm-discord-bot/shared-types/SlashCommand';
import type { SlashCommandI18nDictIdentifier } from '@wpm-discord-bot/shared-types/BotI18n';
import type { ABSOLUTE_BASE_LOCALE_OBJ } from '#𝕃/config';

import createI18nSlashCommandSubcommand from '#@/helpers/interactions/builders/functions/createI18nSlashCommandSubcommand';
import createI18nSlashCommandOption from '#@/helpers/interactions/builders/functions/createI18nSlashCommandOption';
import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import createI18nSlashCommand from '#@/helpers/interactions/builders/functions/createI18nSlashCommand';
import { ApplicationCommandOptionType } from 'discord.js';

import { configCommandCallback } from './configCallback';

const id = 'config' as const satisfies SlashCommandI18nDictIdentifier;
export const vanitySubcommandId = `${id}-vanity` as const satisfies SlashCommandI18nDictIdentifier;

export const configVanityRequiredOptionsConfig = {
  vanity: true,
  role: true
} as const satisfies SlashCommandRequiredOptionsConfig<typeof vanitySubcommandId>;

const vanitySubcommandOptions = [
  createI18nSlashCommandOption({ id: vanitySubcommandId, optionKey: 'vanity' }, { type: ApplicationCommandOptionType.String })
    .setRequired(configVanityRequiredOptionsConfig.vanity)
    .setMaxLength(BOT_APP_HARD_CODED_STATIC_CONTEXT.DB.VARCHAR_LENGTH_CONSTRAINTS.VanityConfig.needle),

  createI18nSlashCommandOption({ id: vanitySubcommandId, optionKey: 'role' }, { type: ApplicationCommandOptionType.Role }).setRequired(
    configVanityRequiredOptionsConfig.role
  )
];

const subcommands = [createI18nSlashCommandSubcommand(vanitySubcommandId, { commandOptions: vanitySubcommandOptions })];

const configCommand = createI18nSlashCommand(id, configCommandCallback, {
  permissions: {
    defaultMemberPermissionsUsingANDGate: new Set(['ManageGuild'] as const satisfies DefaultMemberPermissions[]),
    isUsableInDM: false,
    isPremium: false
  },

  subcommands
});

export default configCommand;

export type ConfigCommandSubcommandsId = (typeof ABSOLUTE_BASE_LOCALE_OBJ)['slashCommands'][typeof vanitySubcommandId]['name'];
