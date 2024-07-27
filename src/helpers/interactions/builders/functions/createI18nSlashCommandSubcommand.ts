import type {
  SlashCommandsHandledByI18nSlashCommandFactoryUnionType as CommandsUnionType,
  SlashCommandDataWithStrictNameAttribute,
  SlashCommandSubcommandsOptions
} from '@wpm-discord-bot/shared-types/SlashCommand';
import type { SlashCommandChannelOption, SlashCommandStringOption, SlashCommandRoleOption, SlashCommandUserOption } from 'discord.js';
import type { SlashCommandI18nDictIdentifier } from '@wpm-discord-bot/shared-types/BotI18n';

import { SlashCommandSubcommandBuilder, ApplicationCommandOptionType } from 'discord.js';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import { absoluteBaseLocale } from '#𝕃/config';

import { buildDescriptionLocalizationsObj, buildNameLocalizationsObj } from './common/i18nSlashCommandsAndSlashSubcommands';

const matchingBuilderEffects = {
  [ApplicationCommandOptionType.Channel]: (commandOption: CommandsUnionType, slashCommand: SlashCommandSubcommandBuilder) =>
    slashCommand.addChannelOption(commandOption as SlashCommandChannelOption),
  [ApplicationCommandOptionType.String]: (commandOption: CommandsUnionType, slashCommand: SlashCommandSubcommandBuilder) =>
    slashCommand.addStringOption(commandOption as SlashCommandStringOption),
  [ApplicationCommandOptionType.User]: (commandOption: CommandsUnionType, slashCommand: SlashCommandSubcommandBuilder) =>
    slashCommand.addUserOption(commandOption as SlashCommandUserOption),
  [ApplicationCommandOptionType.Role]: (commandOption: CommandsUnionType, slashCommand: SlashCommandSubcommandBuilder) =>
    slashCommand.addRoleOption(commandOption as SlashCommandRoleOption)
} as const;

/**
 * @throws {Error}
 */
function appendCommandOptions(commandOptions: CommandsUnionType[], slashCommand: SlashCommandSubcommandBuilder) {
  for (const commandOption of commandOptions) {
    try {
      matchingBuilderEffects[commandOption.type](commandOption, slashCommand);
    } catch {
      throw new Error('Unhandled command option type. Please, monomorphise it.');
    }
  }
}

/**
 * @throws {Error}
 * CASCADE
 */
function createI18nSlashCommandSubcommand<Id extends SlashCommandI18nDictIdentifier>(id: Id, options: SlashCommandSubcommandsOptions = {}) {
  const baseNameAndDescPair = vocabAccessor(absoluteBaseLocale).slashCommands[id];
  const [baseName, baseDescription] = [baseNameAndDescPair.name(), baseNameAndDescPair.description()];

  const slashCommand = new SlashCommandSubcommandBuilder()
    .setName(baseName)
    .setDescription(baseDescription)
    .setNameLocalizations(buildNameLocalizationsObj(id))
    .setDescriptionLocalizations(buildDescriptionLocalizationsObj(id));

  const { commandOptions } = options;

  if (commandOptions !== undefined) appendCommandOptions(commandOptions, slashCommand);

  return slashCommand as SlashCommandDataWithStrictNameAttribute<typeof slashCommand, typeof id>;
}

export default createI18nSlashCommandSubcommand;
