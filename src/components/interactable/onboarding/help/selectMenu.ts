import type { SelectMenu } from '@wpm-discord-bot/shared-types/SelectMenu';
import type { MaybeUndefined } from '@wpm-discord-bot/shared-types/Utils';
import type { Locales } from '#𝕃/typesafe-i18n/i18n-types';
import type { Interaction } from 'discord.js';

import { StringSelectMenuOptionBuilder, StringSelectMenuBuilder } from 'discord.js';
import { attemptToGetLanguageGuildSideOrDmSide } from '#𝕃/getLanguagePipelines';
import { orderedSelectMenuOptions } from '#@/config/commands/onboarding/help';
import { vocabAccessor } from '#𝕃/vocabAccessor';

const name = 'helpMenu' as const;

const getHelpCommandEmbedSelectMenuOptionsVocabScope = (locale: Locales) => vocabAccessor(locale).embeds.helpCommand.selectMenuOptions;

function buildSelectMenuOptions(locale: Locales, selectedOption: MaybeUndefined<HelpCommandEmbedSelectMenuValue>) {
  const vocabScope = getHelpCommandEmbedSelectMenuOptionsVocabScope(locale);

  return orderedSelectMenuOptions.map((menuOption) => {
    const stringSelectMenuOption = new StringSelectMenuOptionBuilder()
      .setLabel(vocabScope[menuOption].label())
      .setDescription(vocabScope[menuOption].description())
      .setValue(menuOption);

    if (menuOption === selectedOption) stringSelectMenuOption.setDefault(true);
    if (selectedOption === undefined && menuOption === 'defaultView') stringSelectMenuOption.setDefault(true);

    return stringSelectMenuOption;
  });
}

export function createHelpSelectMenu(selectedOption?: HelpCommandEmbedSelectMenuValue) {
  const draw = async (interaction: Interaction) => {
    const { guildId, user } = interaction;
    const { id: userId } = user;

    const locale = await attemptToGetLanguageGuildSideOrDmSide({
      guildId,
      userId
    });

    return (
      new StringSelectMenuBuilder()
        // {ToDo} v1.1.0 [HYDRATION FEATURE] -> It should be attached to the message's ID and persisted to be resumable (stateless).
        .setCustomId(name)
        .setPlaceholder(vocabAccessor(locale).embeds.helpCommand.selectMenuPlaceholder())
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(...buildSelectMenuOptions(locale, selectedOption))
    );
  };

  return {
    name,
    draw
  } as const satisfies SelectMenu;
}

export type HelpCommandEmbedSelectMenuValue = keyof ReturnType<typeof getHelpCommandEmbedSelectMenuOptionsVocabScope>;
