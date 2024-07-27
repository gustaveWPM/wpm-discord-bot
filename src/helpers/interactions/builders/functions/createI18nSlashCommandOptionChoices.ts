import type {
  ConstructedSlashCommandWithChoicesPairsOrderedChoicesValuesRecord,
  SlashCommandWithChoicesPairs,
  VocabKey
} from '@wpm-discord-bot/shared-types/BotI18n';
import type { SlashCommandOptionChoicesObject } from '@wpm-discord-bot/shared-types/BotI18nSchema';
import type { APIApplicationCommandOptionChoice, LocalizationMap } from 'discord.js';
import type { Locales } from '#𝕃/typesafe-i18n/i18n-types';
import type { LocalizedString } from 'typesafe-i18n';

import { locales } from '#𝕃/typesafe-i18n/i18n-util';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import { absoluteBaseLocale } from '#𝕃/config';

const buildNameLocalizationsObj = (pair: SlashCommandWithChoicesPairs, choice: VocabKey): LocalizationMap =>
  Object.fromEntries(
    locales.map((locale) => [
      locale,
      (((vocabAccessor(locale).slashCommands[pair.commandId].options as any)[pair.commandOption] as SlashCommandOptionChoicesObject).choices as any)[
        choice
      ]()
    ])
  ) as Record<Locales, LocalizedString>;

function createI18nSlashCommandOptionChoices<P extends SlashCommandWithChoicesPairs>(
  pair: P,
  orderedChoices: ConstructedSlashCommandWithChoicesPairsOrderedChoicesValuesRecord
) {
  const scope = (
    (vocabAccessor(absoluteBaseLocale).slashCommands[pair.commandId].options as any)[pair.commandOption] as SlashCommandOptionChoicesObject
  ).choices;

  return Object.keys(orderedChoices).map(
    (choice) =>
      ({
        value: orderedChoices[choice as keyof typeof orderedChoices],
        name_localizations: buildNameLocalizationsObj(pair, choice),
        name: (scope as any)[choice]()
      }) as const satisfies APIApplicationCommandOptionChoice
  );
}

export default createI18nSlashCommandOptionChoices;
