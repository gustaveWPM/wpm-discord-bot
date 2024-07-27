import type { SlashCommandRequiredOptionsConfig, DefaultMemberPermissions } from '@wpm-discord-bot/shared-types/SlashCommand';
import type { SlashCommandI18nDictIdentifier } from '@wpm-discord-bot/shared-types/BotI18n';

import createI18nSlashCommandOption from '#@/helpers/interactions/builders/functions/createI18nSlashCommandOption';
import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import createI18nSlashCommand from '#@/helpers/interactions/builders/functions/createI18nSlashCommand';
import { ApplicationCommandOptionType } from 'discord.js';

import { banCommandCallback } from './banCallback';

export const id = 'ban' as const satisfies SlashCommandI18nDictIdentifier;

export const banRequiredOptionsConfig = {
  'delete-messages': false,
  duration: false,
  reason: false,
  user: true
} as const satisfies SlashCommandRequiredOptionsConfig<typeof id>;

const commandOptions = [
  createI18nSlashCommandOption({ optionKey: 'user', id }, { type: ApplicationCommandOptionType.User }).setRequired(banRequiredOptionsConfig.user),

  createI18nSlashCommandOption({ optionKey: 'duration', id }, { type: ApplicationCommandOptionType.String })
    .setRequired(banRequiredOptionsConfig.duration)
    .setMaxLength(BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.LIMITS.DURATION_STRING_MAX_LENGTH),

  createI18nSlashCommandOption({ optionKey: 'reason', id }, { type: ApplicationCommandOptionType.String })
    .setRequired(banRequiredOptionsConfig.reason)
    .setMaxLength(BOT_APP_HARD_CODED_STATIC_CONTEXT.DB.VARCHAR_LENGTH_CONSTRAINTS.MODERATION.BannedMembers.reason),

  createI18nSlashCommandOption({ optionKey: 'delete-messages', id }, { type: ApplicationCommandOptionType.String })
    .setRequired(banRequiredOptionsConfig['delete-messages'])
    .setMaxLength(BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.LIMITS.DURATION_STRING_MAX_LENGTH)
];

const banCommand = createI18nSlashCommand(id, banCommandCallback, {
  permissions: {
    defaultMemberPermissionsUsingANDGate: new Set(['BanMembers'] as const satisfies DefaultMemberPermissions[]),
    isUsableInDM: false,
    isPremium: false
  },

  commandOptions
});

export default banCommand;
