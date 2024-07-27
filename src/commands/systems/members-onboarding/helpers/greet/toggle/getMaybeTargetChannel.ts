import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { ChannelWithTextChat } from '@wpm-discord-bot/shared-types/Channels';

import { getGreetToggleInteractionOptions } from './getInteractionOptions';

function getMaybeTargetChannel(interaction: GuildInteraction) {
  const [maybeChannelFromOptions] = getGreetToggleInteractionOptions(interaction);
  const maybeChannel = maybeChannelFromOptions === null ? interaction.channel : (maybeChannelFromOptions as ChannelWithTextChat);

  return maybeChannel;
}

export default getMaybeTargetChannel;
