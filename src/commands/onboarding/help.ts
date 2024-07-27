import type { SlashCommandI18nDictIdentifier } from '@wpm-discord-bot/shared-types/BotI18n';

import createI18nSlashCommand from '#@/helpers/interactions/builders/functions/createI18nSlashCommand';

import { helpCommandCallback } from './helpCallback';

const id = 'help' as const satisfies SlashCommandI18nDictIdentifier;

const helpCommand = createI18nSlashCommand(id, helpCommandCallback, {
  permissions: {
    isUsableInDM: true,
    isPremium: false
  }
});

export default helpCommand;
