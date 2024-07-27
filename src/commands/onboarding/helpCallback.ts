import type { ChatInputCommandInteraction, StringSelectMenuInteraction, StringSelectMenuBuilder, ComponentType } from 'discord.js';
import type { HelpCommandEmbedSelectMenuValue } from '#@/components/interactable/onboarding/help/selectMenu';
import type { MsValue } from '@wpm-discord-bot/shared-types/Number';

import isTimeoutInterruptionOfInteractionCollectorExpectedBehavior from '@wpm-discord-bot/shared-lib/discordjs/isTimeoutInterruptionOfInteractionCollectorExpectedBehavior';
import buildHelpCommandTraceAdditionalInformations from '@wpm-discord-bot/shared-lib/portable/trace/builders/functions/buildHelpCommandTraceAdditionalInformations';
import helpCommandEmbedDefaultView from '#@/components/static/onboarding/help/embedDefaultView';
import { createHelpSelectMenu } from '#@/components/interactable/onboarding/help/selectMenu';
import attemptToEditReply from '@wpm-discord-bot/shared-lib/discordjs/attemptToEditReply';
import { matchingEmbeds } from '#@/config/commands/onboarding/help';
import traceError from '#@/helpers/interactions/traceError';
import { ActionRowBuilder } from 'discord.js';

const TIMEOUT: MsValue = 6e5;

async function getHelpCommandEmbedDefaultView(interaction: ChatInputCommandInteraction) {
  const selectMenu = await createHelpSelectMenu().draw(interaction);
  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

  return await interaction.reply({ embeds: [await helpCommandEmbedDefaultView(interaction)], components: [row], ephemeral: true });
}

/**
 * @throws {Error}
 * error: Collector received no interactions before ending with reason: ...
 * code: "InteractionCollectorError"
 */
async function interactionLoop(confirmation: StringSelectMenuInteraction) {
  let currentInteraction = confirmation;

  while (true) {
    const targettedViewSelectedOption = currentInteraction.values[0] as HelpCommandEmbedSelectMenuValue;

    const selectMenu = await createHelpSelectMenu(targettedViewSelectedOption).draw(currentInteraction);
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    await currentInteraction.update({
      embeds: [await matchingEmbeds[targettedViewSelectedOption](currentInteraction)],
      components: [row]
    });

    currentInteraction = await currentInteraction.message.awaitMessageComponent<ComponentType.StringSelect>({ time: TIMEOUT });
  }
}

export async function helpCommandCallback(interaction: ChatInputCommandInteraction) {
  try {
    try {
      var defaultViewInteractionResponse = await getHelpCommandEmbedDefaultView(interaction);
    } catch (error) {
      traceError(error, buildHelpCommandTraceAdditionalInformations(interaction));
      return;
    }

    const confirmation = await defaultViewInteractionResponse.awaitMessageComponent<ComponentType.StringSelect>({ time: TIMEOUT });
    await interactionLoop(confirmation);
  } catch (interruption) {
    if (!isTimeoutInterruptionOfInteractionCollectorExpectedBehavior(interruption)) {
      traceError(interruption, buildHelpCommandTraceAdditionalInformations(interaction));
    }
    // {ToDo} v1.1.0 [HYDRATION FEATURE] -> Remove this component from hydration persistance.
    attemptToEditReply(interaction, { components: [] });
  }
}
