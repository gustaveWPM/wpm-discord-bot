import type { SlashCommandI18nDictIdentifier } from '@wpm-discord-bot/shared-types/BotI18n';
import type { devGuildOnlyCommandsRecord } from '#@/config/commands/filtering';

export type GuildSlashCommandID = Extract<SlashCommandI18nDictIdentifier, keyof typeof devGuildOnlyCommandsRecord>;
export type GlobalSlashCommandID = Exclude<SlashCommandI18nDictIdentifier, keyof typeof devGuildOnlyCommandsRecord>;

export type GlobalSlashCommandMagicString = `</${GlobalSlashCommandID}:${string}>`;
