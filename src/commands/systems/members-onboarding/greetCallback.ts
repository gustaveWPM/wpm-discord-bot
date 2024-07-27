import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { ChatInputCommandInteraction } from 'discord.js';

import buildGreetCommandTraceAdditionalInformations from '@wpm-discord-bot/shared-lib/portable/trace/builders/functions/buildGreetCommandTraceAdditionalInformations';
import buildGuildInteractionFromGuildMemberToAnotherGuildMember from '@wpm-discord-bot/shared-lib/discordjs/buildGuildInteractionFromGuildMemberToAnotherGuildMember';
import traceError from '#@/helpers/interactions/traceError';

import type { GreetCommandSubcommandsId } from './greet';

import failedToInteract from './helpers/greet/failedToInteract';
import { toggleHandler } from './helpers/greet/toggle/handler';
import { infosHandler } from './helpers/greet/infos/handler';

const subcommandsHandlers = {
  toggle: toggleHandler,
  infos: infosHandler
} as const satisfies Record<GreetCommandSubcommandsId, (interaction: GuildInteraction) => Promise<void>>;

export async function greetCommandCallback(justChatInteraction: ChatInputCommandInteraction) {
  const { guildInteraction: interaction, callerMember } = buildGuildInteractionFromGuildMemberToAnotherGuildMember(justChatInteraction);

  if (interaction === undefined || callerMember === undefined) {
    failedToInteract(justChatInteraction);
    return;
  }

  const subcommand = interaction.options.getSubcommand() as keyof typeof subcommandsHandlers;
  try {
    await subcommandsHandlers[subcommand](interaction);
  } catch (error) {
    traceError(error, buildGreetCommandTraceAdditionalInformations(interaction, subcommand));
    failedToInteract(justChatInteraction);
  }
}
