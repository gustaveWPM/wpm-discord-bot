import type {
  SlashCommandsHandledByI18nSlashCommandFactoryUnionType as CommandsUnionType,
  SlashCommandDataWithStrictNameAttribute,
  SlashCommandGuardsPermissions,
  SlashCommandPermissions,
  SlashCommandCallback,
  SlashCommandOptions,
  SlashCommand
} from '@wpm-discord-bot/shared-types/SlashCommand';
import type {
  SlashCommandOptionsOnlyBuilder,
  ChatInputCommandInteraction,
  SlashCommandChannelOption,
  SlashCommandStringOption,
  SlashCommandUserOption,
  SlashCommandRoleOption
} from 'discord.js';
import type { SlashCommandI18nDictIdentifier } from '@wpm-discord-bot/shared-types/BotI18n';

import { ApplicationCommandOptionType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import { absoluteBaseLocale } from '#𝕃/config';

import { buildDescriptionLocalizationsObj, buildNameLocalizationsObj } from './common/i18nSlashCommandsAndSlashSubcommands';
import slashCommandPreExecute from '../../guards/slashCommandPreExecute';

// NOTE: https://github.com/discord/discord-api-docs/discussions/6919
// The | (OR) is used to merge the bit flags, as a & (AND)... Hence, we only have the AND gate for now.
function appendPermissions(permissions: SlashCommandPermissions, slashCommand: SlashCommandOptionsOnlyBuilder) {
  if (permissions.defaultMemberPermissionsUsingANDGate && permissions.defaultMemberPermissionsUsingANDGate.size > 0) {
    const mergedDefaultMemberPermissions = Array.from(permissions.defaultMemberPermissionsUsingANDGate).reduce(
      (mergedBitFlags, currentBitFlagKey) => mergedBitFlags | PermissionFlagsBits[currentBitFlagKey],
      0n
    );
    slashCommand.setDefaultMemberPermissions(mergedDefaultMemberPermissions);
  }

  slashCommand.setDMPermission(permissions.isUsableInDM);
}

const matchingBuilderEffects = {
  [ApplicationCommandOptionType.Channel]: (commandOption: CommandsUnionType, slashCommand: SlashCommandOptionsOnlyBuilder) =>
    slashCommand.addChannelOption(commandOption as SlashCommandChannelOption),
  [ApplicationCommandOptionType.String]: (commandOption: CommandsUnionType, slashCommand: SlashCommandOptionsOnlyBuilder) =>
    slashCommand.addStringOption(commandOption as SlashCommandStringOption),
  [ApplicationCommandOptionType.User]: (commandOption: CommandsUnionType, slashCommand: SlashCommandOptionsOnlyBuilder) =>
    slashCommand.addUserOption(commandOption as SlashCommandUserOption),
  [ApplicationCommandOptionType.Role]: (commandOption: CommandsUnionType, slashCommand: SlashCommandOptionsOnlyBuilder) =>
    slashCommand.addRoleOption(commandOption as SlashCommandRoleOption)
} as const;

/**
 * @throws {Error}
 */
function appendCommandOptions(commandOptions: CommandsUnionType[], slashCommand: SlashCommandOptionsOnlyBuilder) {
  for (const commandOption of commandOptions) {
    try {
      matchingBuilderEffects[commandOption.type](commandOption, slashCommand);
    } catch {
      throw new Error('Unhandled command option type. Please, monomorphise it.');
    }
  }
}

function buildExecuteFunction(cb: SlashCommandCallback, guardsPermissions: SlashCommandGuardsPermissions) {
  /**
   * @throws {unknown}
   */
  return async function execute(interaction: ChatInputCommandInteraction) {
    try {
      (await slashCommandPreExecute(interaction, guardsPermissions)) && (await cb(interaction));
    } catch (throwable) {
      throw throwable;
    }
  };
}

/**
 * @throws {Error}
 * CASCADE
 */
function createI18nSlashCommand<Id extends SlashCommandI18nDictIdentifier>(id: Id, cb: SlashCommandCallback, options: SlashCommandOptions) {
  const baseNameAndDescPair = vocabAccessor(absoluteBaseLocale).slashCommands[id];
  const [baseName, baseDescription] = [baseNameAndDescPair.name(), baseNameAndDescPair.description()];

  const slashCommand = new SlashCommandBuilder()
    .setName(baseName)
    .setDescription(baseDescription)
    .setNameLocalizations(buildNameLocalizationsObj(id))
    .setDescriptionLocalizations(buildDescriptionLocalizationsObj(id))
    .setNSFW(Boolean(options.isNSFW));

  if (options.subcommands !== undefined) {
    for (const subcommand of options.subcommands) {
      slashCommand.addSubcommand(subcommand);
    }
  }

  const { commandOptions, permissions } = options;

  appendPermissions(permissions, slashCommand);
  if (commandOptions !== undefined) appendCommandOptions(commandOptions, slashCommand);

  const { isPremium } = permissions;
  const execute = buildExecuteFunction(cb, { isPremium });

  return {
    data: slashCommand as SlashCommandDataWithStrictNameAttribute<typeof slashCommand, typeof id>,
    execute
  } as const satisfies SlashCommand;
}

export default createI18nSlashCommand;
