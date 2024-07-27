import type { SlashCommand } from '@wpm-discord-bot/shared-types/SlashCommand';
import type { SlashCommandName } from '@wpm-discord-bot/shared-types/String';
import type { MaybeObjectValue } from '@wpm-discord-bot/shared-types/Utils';

import { devGuildOnlyCommandsRecord } from '#@/config/commands/filtering';
import greet from '#@/commands/systems/members-onboarding/greet';
import help from '#@/commands/onboarding/help';
import warn from '#@/commands/moderation/warn';
import mute from '#@/commands/moderation/mute';
import kick from '#@/commands/moderation/kick';
import config from '#@/commands/config/config';
import ban from '#@/commands/moderation/ban';
import ping from '#@/commands/utility/ping';

export const allCommands = {
  [config.data.name]: config,
  [greet.data.name]: greet,
  [ping.data.name]: ping,
  [help.data.name]: help,
  [warn.data.name]: warn,
  [mute.data.name]: mute,
  [kick.data.name]: kick,
  [ban.data.name]: ban
} as const satisfies CommandsRecord;

const commands = Object.values(allCommands);

const isDevGuildOnlyCommand = (commandName: StrictSlashCommandName) =>
  (
    devGuildOnlyCommandsRecord as Record<
      StrictSlashCommandName,
      MaybeObjectValue<(typeof devGuildOnlyCommandsRecord)[keyof typeof devGuildOnlyCommandsRecord]>
    >
  )[commandName] !== undefined;

export const serializedGlobalCommands = commands
  .filter((command) => !isDevGuildOnlyCommand(command.data.name))
  .map((command) => command.data.toJSON());

export const serializedGuildCommands = commands.filter((command) => isDevGuildOnlyCommand(command.data.name)).map((command) => command.data.toJSON());

export default commands;

type CommandsRecord = Record<SlashCommandName, SlashCommand>;
type StrictSlashCommandName = keyof typeof allCommands;
