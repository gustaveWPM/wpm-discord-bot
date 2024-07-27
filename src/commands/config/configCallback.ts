import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { ChatInputCommandInteraction } from 'discord.js';

import buildGuildInteractionFromGuildMemberToAnotherGuildMember from '@wpm-discord-bot/shared-lib/discordjs/buildGuildInteractionFromGuildMemberToAnotherGuildMember';
import attemptToReplyToInteraction from '@wpm-discord-bot/shared-lib/discordjs/attemptToReplyToInteraction';
import { attemptToGetLanguageGuildSideOrDmSide } from '#𝕃/getLanguagePipelines';
import traceError from '#@/helpers/interactions/traceError';
import { vocabAccessor } from '#𝕃/vocabAccessor';

import type { ConfigCommandSubcommandsId } from './config';

import { vanityHandler } from './helpers/vanity/handler';

const subcommandsHandlers = {
  vanity: vanityHandler
} as const satisfies Record<ConfigCommandSubcommandsId, (interaction: GuildInteraction) => Promise<void>>;

export const failedToInteract = async (justChatInteraction: ChatInputCommandInteraction) =>
  attemptToReplyToInteraction(justChatInteraction, {
    content: vocabAccessor(
      await attemptToGetLanguageGuildSideOrDmSide({
        guildId: justChatInteraction.guildId,
        userId: justChatInteraction.user.id
      })
    ).vocab.failedToInteract(),

    ephemeral: true
  });

export async function configCommandCallback(justChatInteraction: ChatInputCommandInteraction) {
  const { guildInteraction: interaction, callerMember } = buildGuildInteractionFromGuildMemberToAnotherGuildMember(justChatInteraction);

  if (interaction === undefined || callerMember === undefined) {
    failedToInteract(justChatInteraction);
    return;
  }

  const subcommand = interaction.options.getSubcommand() as keyof typeof subcommandsHandlers;
  try {
    await subcommandsHandlers[subcommand](interaction);
  } catch (error) {
    // {ToDo} Tailor-made trace error
    traceError(error);
    failedToInteract(justChatInteraction);
  }
}
