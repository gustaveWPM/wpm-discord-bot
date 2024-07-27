import type { GlobalSlashCommandID, GuildSlashCommandID } from '#@/types/SlashCommand';
import type { APIApplicationCommand } from 'discord.js';

namespace Runtime {
  export const registeredGuildCommands = {} as Record<GuildSlashCommandID, APIApplicationCommand>;
  export const registeredGlobalCommands = {} as Record<GlobalSlashCommandID, APIApplicationCommand>;
}

export const pushRegisteredGuildCommand = <CommandName extends GuildSlashCommandID>(command: APIApplicationCommand & { name: CommandName }) =>
  (Runtime.registeredGuildCommands[command.name] = command);

export const pushRegisteredGlobalCommand = <CommandName extends GlobalSlashCommandID>(command: APIApplicationCommand & { name: CommandName }) =>
  (Runtime.registeredGlobalCommands[command.name] = command);

export const getRegisteredGlobalCommand = <CommandName extends GlobalSlashCommandID>(commandName: CommandName) =>
  Runtime.registeredGlobalCommands[commandName];
