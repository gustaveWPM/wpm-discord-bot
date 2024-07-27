import type {
  SlashCommandI18nDictIdentifierAndOptionKeyPair,
  SlashCommandOptionEntityTranslateFunctions,
  VocabValue
} from '@wpm-discord-bot/shared-types/BotI18n';
import type { Couple } from '@wpm-discord-bot/shared-types/Utils';
import type { Locales } from '#𝕃/typesafe-i18n/i18n-types';
import type { LocalizedString } from 'typesafe-i18n';
import type { LocalizationMap } from 'discord.js';

import {
  ApplicationCommandOptionType,
  SlashCommandChannelOption,
  SlashCommandStringOption,
  SlashCommandUserOption,
  SlashCommandRoleOption
} from 'discord.js';
import { locales } from '#𝕃/typesafe-i18n/i18n-util';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import { absoluteBaseLocale } from '#𝕃/config';

const buildNameLocalizationsObj = (pair: SlashCommandI18nDictIdentifierAndOptionKeyPair): LocalizationMap =>
  Object.fromEntries(
    locales.map((locale) => [
      locale,
      ((vocabAccessor(locale).slashCommands[pair.id].options as any)[pair.optionKey] as SlashCommandOptionEntityTranslateFunctions).name()
    ])
  ) as Record<Locales, LocalizedString>;

const buildDescriptionLocalizationsObj = (pair: SlashCommandI18nDictIdentifierAndOptionKeyPair): LocalizationMap =>
  Object.fromEntries(
    locales.map((locale) => [
      locale,
      ((vocabAccessor(locale).slashCommands[pair.id].options as any)[pair.optionKey] as SlashCommandOptionEntityTranslateFunctions).description()
    ])
  ) as Record<Locales, LocalizedString>;

const buildSlashCommandStringOption = (baseName: VocabValue, baseDescription: VocabValue, pair: SlashCommandI18nDictIdentifierAndOptionKeyPair) =>
  new SlashCommandStringOption()
    .setName(baseName)
    .setDescription(baseDescription)
    .setNameLocalizations(buildNameLocalizationsObj(pair))
    .setDescriptionLocalizations(buildDescriptionLocalizationsObj(pair));

const buildSlashCommandUserOption = (baseName: VocabValue, baseDescription: VocabValue, pair: SlashCommandI18nDictIdentifierAndOptionKeyPair) =>
  new SlashCommandUserOption()
    .setName(baseName)
    .setDescription(baseDescription)
    .setNameLocalizations(buildNameLocalizationsObj(pair))
    .setDescriptionLocalizations(buildDescriptionLocalizationsObj(pair));

const buildSlashCommandRoleOption = (baseName: VocabValue, baseDescription: VocabValue, pair: SlashCommandI18nDictIdentifierAndOptionKeyPair) =>
  new SlashCommandRoleOption()
    .setName(baseName)
    .setDescription(baseDescription)
    .setNameLocalizations(buildNameLocalizationsObj(pair))
    .setDescriptionLocalizations(buildDescriptionLocalizationsObj(pair));

const buildSlashCommandChannelOption = (baseName: VocabValue, baseDescription: VocabValue, pair: SlashCommandI18nDictIdentifierAndOptionKeyPair) =>
  new SlashCommandChannelOption()
    .setName(baseName)
    .setDescription(baseDescription)
    .setNameLocalizations(buildNameLocalizationsObj(pair))
    .setDescriptionLocalizations(buildDescriptionLocalizationsObj(pair));

const matchingBuilders = {
  [ApplicationCommandOptionType.Channel]: buildSlashCommandChannelOption,
  [ApplicationCommandOptionType.String]: buildSlashCommandStringOption,
  [ApplicationCommandOptionType.User]: buildSlashCommandUserOption,
  [ApplicationCommandOptionType.Role]: buildSlashCommandRoleOption
} as const satisfies Partial<
  Record<
    ApplicationCommandOptionType,
    (baseName: VocabValue, baseDescription: VocabValue, pair: SlashCommandI18nDictIdentifierAndOptionKeyPair) => unknown
  >
>;

/**
 * @throws {Error}
 */
function createI18nSlashCommandOption<T extends OptionsUnionType>(
  pair: SlashCommandI18nDictIdentifierAndOptionKeyPair,
  monomorphism: Monomorphism<T>
): SlashCommandOptionReturnType<T> {
  const baseNameAndDescPair = (vocabAccessor(absoluteBaseLocale).slashCommands[pair.id].options as any)[
    pair.optionKey
  ] as SlashCommandOptionEntityTranslateFunctions;

  const { type } = monomorphism;

  const [baseName, baseDescription]: Couple<string> = [baseNameAndDescPair.name(), baseNameAndDescPair.description()];

  const maybeBuilder = matchingBuilders[type];
  if (maybeBuilder === undefined) throw new Error('Unhandled command option type. Please, monomorphise it.');

  return maybeBuilder(baseName, baseDescription, pair) as SlashCommandOptionReturnType<T>;
}

export default createI18nSlashCommandOption;

type Monomorphism<T extends OptionsUnionType> = {
  type: T;
};

type T = typeof ApplicationCommandOptionType;
type OptionsUnionType = T['Channel'] | T['String'] | T['User'] | T['Role'];

type ApplicationCommandOptionTypeAndBuilderAssoc = {
  [ApplicationCommandOptionType.Channel]: SlashCommandChannelOption;
  [ApplicationCommandOptionType.String]: SlashCommandStringOption;
  [ApplicationCommandOptionType.User]: SlashCommandUserOption;
  [ApplicationCommandOptionType.Role]: SlashCommandRoleOption;
};

type SlashCommandOptionReturnType<T extends OptionsUnionType> = ApplicationCommandOptionTypeAndBuilderAssoc[T];
