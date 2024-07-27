import type {
  SlashCommandSubcommandBuilder,
  ChatInputCommandInteraction,
  SlashCommandChannelOption,
  SlashCommandStringOption,
  SlashCommandUserOption,
  SlashCommandRoleOption,
  SlashCommandBuilder,
  PermissionFlagsBits,
  Collection
} from 'discord.js';

import type { SlashCommandI18nDictIdentifier, I18nSlashCommandOptions } from './BotI18n';
import type { SlashCommandName } from './String';
import type { IsPremium } from './Boolean';

export type SlashCommandCallback = (interaction: ChatInputCommandInteraction) => Promise<void>;

export type SlashCommand = {
  execute: SlashCommandCallback;
  data: SlashCommandBuilder;
};

export type SlashCommands = Collection<SlashCommandName, SlashCommand>;

export type SlashCommandDataWithStrictNameAttribute<Data extends SlashCommandSubcommandBuilder | SlashCommandBuilder, Name extends string> = {
  name: Name;
} & Data;

export type SlashCommandRequiredOptionsConfig<Id extends SlashCommandI18nDictIdentifier> = Record<I18nSlashCommandOptions<Id>, boolean>;

export type SlashCommandPermissions = {
  defaultMemberPermissionsUsingANDGate?: Set<DefaultMemberPermissions>;
  isUsableInDM: boolean;
  isPremium: IsPremium;
};

export type SlashCommandGuardsPermissions = Pick<SlashCommandPermissions, 'isPremium'>;

export type SlashCommandOptions = (
  | { commandOptions: SlashCommandsHandledByI18nSlashCommandFactoryUnionType[]; subcommands?: undefined }
  | { subcommands: SlashCommandSubcommandBuilder[]; commandOptions?: undefined }
  | { commandOptions?: undefined; subcommands?: undefined }
) & {
  permissions: SlashCommandPermissions;
  isNSFW?: boolean;
};

export type SlashCommandSubcommandsOptions = Partial<{ commandOptions: SlashCommandsHandledByI18nSlashCommandFactoryUnionType[] }>;

export type PermissionLabel = keyof typeof PermissionFlagsBits;
export type SlashCommandsHandledByI18nSlashCommandFactoryUnionType =
  | SlashCommandChannelOption
  | SlashCommandStringOption
  | SlashCommandUserOption
  | SlashCommandRoleOption;
export type DefaultMemberPermissions = PermissionLabel;
