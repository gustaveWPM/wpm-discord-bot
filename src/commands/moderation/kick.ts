import type { SlashCommandRequiredOptionsConfig, DefaultMemberPermissions } from '@wpm-discord-bot/shared-types/SlashCommand';
import type { SlashCommandI18nDictIdentifier } from '@wpm-discord-bot/shared-types/BotI18n';

import createI18nSlashCommandOption from '#@/helpers/interactions/builders/functions/createI18nSlashCommandOption';
import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import createI18nSlashCommand from '#@/helpers/interactions/builders/functions/createI18nSlashCommand';
import { ApplicationCommandOptionType } from 'discord.js';

import { kickCommandCallback } from './kickCallback';

export const id = 'kick' as const satisfies SlashCommandI18nDictIdentifier;

export const kickRequiredOptionsConfig = {
  reason: false,
  member: true
} as const satisfies SlashCommandRequiredOptionsConfig<typeof id>;

const commandOptions = [
  createI18nSlashCommandOption({ optionKey: 'member', id }, { type: ApplicationCommandOptionType.User }).setRequired(
    kickRequiredOptionsConfig.member
  ),

  createI18nSlashCommandOption({ optionKey: 'reason', id }, { type: ApplicationCommandOptionType.String })
    .setRequired(kickRequiredOptionsConfig.reason)
    .setMaxLength(BOT_APP_HARD_CODED_STATIC_CONTEXT.DB.VARCHAR_LENGTH_CONSTRAINTS.MODERATION.KickedMembers.reason)
];

const kickCommand = createI18nSlashCommand(id, kickCommandCallback, {
  permissions: {
    defaultMemberPermissionsUsingANDGate: new Set(['KickMembers'] as const satisfies DefaultMemberPermissions[]),
    isUsableInDM: false,
    isPremium: false
  },

  commandOptions
});

export default kickCommand;
