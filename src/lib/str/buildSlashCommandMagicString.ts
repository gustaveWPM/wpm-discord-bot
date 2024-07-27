import type { GlobalSlashCommandMagicString, GlobalSlashCommandID } from '#@/types/SlashCommand';

import { getRegisteredGlobalCommand } from '#@/cache/runtime';

export const buildGlobalSlashCommandMagicString = (commandName: GlobalSlashCommandID): GlobalSlashCommandMagicString =>
  `</${commandName}:${getRegisteredGlobalCommand(commandName).id}>`;
