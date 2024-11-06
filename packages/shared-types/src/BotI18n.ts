import type { SHARED_VOCAB_SCHEMA, SlashCommandOption, FlatVocabShape, SlashCommands, SlashCommand } from './BotI18nSchema';
import type { MakeHomogeneousValuesObjType } from './Utils';
import type VOCAB_SCHEMA from './BotI18nSchema';

type AllowedVocabObjValuesTypes = string;

export type VocabKey = string;
export type VocabValue = AllowedVocabObjValuesTypes;

type VocabBase = typeof VOCAB_SCHEMA;

export type VocabType = MakeHomogeneousValuesObjType<VocabBase, VocabValue>;

type SharedVocabBase = typeof SHARED_VOCAB_SCHEMA;
export type SharedVocabType = MakeHomogeneousValuesObjType<SharedVocabBase, VocabValue>;

export type SlashCommandI18nDictIdentifier = keyof (typeof VOCAB_SCHEMA)['slashCommands'];

export type SlashCommandOptionEntityTranslateFunctions = {
  [K in keyof SlashCommandOption]: () => SlashCommandOption[K];
};

export type SlashCommandI18nDictIdentifierAndOptionKeyPair = {
  [Id in SlashCommandI18nDictIdentifier]: {
    optionKey: keyof SlashCommandsRoot[Id]['options'];
    id: Id;
  };
}[SlashCommandI18nDictIdentifier];

type SlashCommandsRoot = (typeof VOCAB_SCHEMA)['slashCommands'];

export type I18nSlashCommandOptions<Id extends SlashCommandI18nDictIdentifier> = keyof SlashCommandsRoot[Id]['options'];

export type SlashCommandWithChoicesPairs = MakeSlashCommandWithChoicesPairs<(typeof VOCAB_SCHEMA)['slashCommands']>;

export type UnpredictibleLocale = string;

type ExtractOptionsWithChoices<T> = {
  [K in keyof T]: T[K] extends ChoicesFragment ? K : never;
}[keyof T];

type MakeSlashCommandWithChoicesPairs<T extends Record<VocabKey, any>> = {
  [K in keyof T]: T[K] extends SlashCommand
    ? ExtractOptionsWithChoices<T[K]['options']> extends never
      ? never
      : { commandOption: ExtractOptionsWithChoices<T[K]['options']>; commandId: K }
    : never;
}[keyof T];

type SlashCommandsWithChoices<T extends SlashCommands> = {
  [K in keyof T]: T[K]['options'] extends Record<VocabKey, infer O> ? (O extends ChoicesFragment ? K : never) : never;
}[keyof T];

type CommandsWithChoices = SlashCommandsWithChoices<VocabType['slashCommands']>;

type SlashCommandWithChoicesPairsOrderedChoicesValuesRecord = Pick<
  {
    [CMD_ID in keyof (typeof VOCAB_SCHEMA)['slashCommands']]: CMD_ID extends CommandsWithChoices
      ? {
          [OPTION_WITH_CHOICES_ID in keyof (typeof VOCAB_SCHEMA)['slashCommands'][CMD_ID]['options'] as (typeof VOCAB_SCHEMA)['slashCommands'][CMD_ID]['options'][OPTION_WITH_CHOICES_ID] extends ChoicesFragment
            ? OPTION_WITH_CHOICES_ID
            : never]: (typeof VOCAB_SCHEMA)['slashCommands'][CMD_ID]['options'][OPTION_WITH_CHOICES_ID] extends ChoicesFragment
            ? Record<keyof (typeof VOCAB_SCHEMA)['slashCommands'][CMD_ID]['options'][OPTION_WITH_CHOICES_ID]['choices'], VocabValue>
            : never;
        }
      : never;
  },
  CommandsWithChoices
>;

export type SlashCommandWithChoicesPairsOrderedChoicesValuesRecordConstructor<
  CMD_ID extends CommandsWithChoices,
  OPTION_WITH_CHOICES_ID extends keyof SlashCommandWithChoicesPairsOrderedChoicesValuesRecord[CMD_ID]
> = SlashCommandWithChoicesPairsOrderedChoicesValuesRecord[CMD_ID][OPTION_WITH_CHOICES_ID];

export type ConstructedSlashCommandWithChoicesPairsOrderedChoicesValuesRecord = {
  [CMD_ID in CommandsWithChoices]: {
    [OPTION_WITH_CHOICES_ID in keyof SlashCommandWithChoicesPairsOrderedChoicesValuesRecord[CMD_ID]]: SlashCommandWithChoicesPairsOrderedChoicesValuesRecord[CMD_ID][OPTION_WITH_CHOICES_ID];
  }[keyof SlashCommandWithChoicesPairsOrderedChoicesValuesRecord[CMD_ID]];
}[CommandsWithChoices];

type ChoicesFragment = { choices: FlatVocabShape };
