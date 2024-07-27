import type { HelpCommandEmbedSelectMenuValue } from '#@/components/interactable/onboarding/help/selectMenu';
import type { ChatInputCommandInteraction, StringSelectMenuInteraction, EmbedBuilder } from 'discord.js';

import helpCommandEmbedModerationView from '#@/components/static/onboarding/help/embedModerationView';
import helpCommandEmbedDefaultView from '#@/components/static/onboarding/help/embedDefaultView';

const _ = null;

export const matchingEmbeds = {
  moderation: helpCommandEmbedModerationView,
  defaultView: helpCommandEmbedDefaultView
} as const satisfies Record<
  HelpCommandEmbedSelectMenuValue,
  (interaction: ChatInputCommandInteraction | StringSelectMenuInteraction) => Promise<EmbedBuilder>
>;

/* eslint-disable perfectionist/sort-objects */

// NOTE: Just to get accurate type errors (Record keys are forced to be exhaustive)
// * ... ATTENTION! The options of your select menu will be ordered as the keys of this object are ordered!
const exhaustiveOrderedOptions = {
  defaultView: _,
  moderation: _
} as const satisfies Record<HelpCommandEmbedSelectMenuValue, typeof _>;

/* eslint-enable perfectionist/sort-objects */

export const orderedSelectMenuOptions = Object.keys(exhaustiveOrderedOptions) as readonly HelpCommandEmbedSelectMenuValue[];
