import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { ExtendedClient } from '@wpm-discord-bot/shared-types/BotClient';

import attemptToReplyToInteraction from '@wpm-discord-bot/shared-lib/discordjs/attemptToReplyToInteraction';
import greetInfoEmbed from '#@/components/static/members-onboarding/greet/greetInfoEmbed';

export async function infosHandler(interaction: GuildInteraction) {
  const { client, guild, user } = interaction;
  const { id: userId } = user;

  const embed = await greetInfoEmbed({ client: client as ExtendedClient, userId, guild });

  await attemptToReplyToInteraction(interaction, { ephemeral: true, embeds: [embed] });
}
