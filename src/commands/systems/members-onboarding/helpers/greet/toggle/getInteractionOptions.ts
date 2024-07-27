import type { SlashCommandI18nDictIdentifierAndOptionKeyPair } from '@wpm-discord-bot/shared-types/BotI18n';
import type { ChatInputCommandInteraction } from 'discord.js';

import { greetToggleRequiredOptionsConfig, toggleSubcommandId as id } from '../../../greet';

export function getGreetToggleInteractionOptions(interaction: ChatInputCommandInteraction): [ReturnType<typeof interaction.options.getChannel>] {
  const [typesafeChannelOptionKeyAssoc] = [{ optionKey: 'channel', id } satisfies SlashCommandI18nDictIdentifierAndOptionKeyPair] as const;

  const [{ optionKey: channelOptionKey }] = [typesafeChannelOptionKeyAssoc];

  const maybeChannel = interaction.options.getChannel(channelOptionKey, greetToggleRequiredOptionsConfig[channelOptionKey]);

  return [maybeChannel] as const;
}
