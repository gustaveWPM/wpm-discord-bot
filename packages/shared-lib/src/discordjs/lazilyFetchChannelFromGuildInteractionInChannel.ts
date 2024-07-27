import type { GuildInteractionInChannel } from '@wpm-discord-bot/shared-types/Interaction';

// NOTE: partial -> Whether this Channel is a partial. (This is always false outside of DM channels.)
// https://discord.js.org/docs/packages/discord.js/14.15.3/TextChannel:Class#partial
// We are just prudent to avoid regressions in the future here! It should always be lazy in practice.
async function lazilyFetchChannelFromGuildInteractionInChannel(interaction: GuildInteractionInChannel) {
  const { channel: c } = interaction;

  const channel = c.partial ? await c.fetch(true) : c;
  return channel;
}

export default lazilyFetchChannelFromGuildInteractionInChannel;
