import type { SlashCommandRequiredOptionsConfig, DefaultMemberPermissions } from '@wpm-discord-bot/shared-types/SlashCommand';
import type { SlashCommandI18nDictIdentifier } from '@wpm-discord-bot/shared-types/BotI18n';

import createI18nSlashCommandOption from '#@/helpers/interactions/builders/functions/createI18nSlashCommandOption';
import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import createI18nSlashCommand from '#@/helpers/interactions/builders/functions/createI18nSlashCommand';
import { ApplicationCommandOptionType } from 'discord.js';

import { muteCommandCallback } from './muteCallback';

export const id = 'mute' as const satisfies SlashCommandI18nDictIdentifier;

export const muteRequiredOptionsConfig = {
  duration: true,
  reason: false,
  member: true
} as const satisfies SlashCommandRequiredOptionsConfig<typeof id>;

const commandOptions = [
  createI18nSlashCommandOption({ optionKey: 'member', id }, { type: ApplicationCommandOptionType.User }).setRequired(
    muteRequiredOptionsConfig.member
  ),

  createI18nSlashCommandOption({ optionKey: 'duration', id }, { type: ApplicationCommandOptionType.String })
    .setRequired(muteRequiredOptionsConfig.duration)
    .setMaxLength(BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.LIMITS.DURATION_STRING_MAX_LENGTH),

  createI18nSlashCommandOption({ optionKey: 'reason', id }, { type: ApplicationCommandOptionType.String })
    .setRequired(muteRequiredOptionsConfig.reason)
    .setMaxLength(BOT_APP_HARD_CODED_STATIC_CONTEXT.DB.VARCHAR_LENGTH_CONSTRAINTS.MODERATION.MutedMembers.reason)
];

const muteCommand = createI18nSlashCommand(id, muteCommandCallback, {
  permissions: {
    defaultMemberPermissionsUsingANDGate: new Set(['ModerateMembers'] as const satisfies DefaultMemberPermissions[]),
    isUsableInDM: false,
    isPremium: false
  },

  commandOptions
});

export default muteCommand;
