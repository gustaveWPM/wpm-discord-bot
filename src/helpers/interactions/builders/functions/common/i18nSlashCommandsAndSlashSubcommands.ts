import type { SlashCommandI18nDictIdentifier } from '@wpm-discord-bot/shared-types/BotI18n';
import type { Locales } from '#𝕃/typesafe-i18n/i18n-types';
import type { LocalizedString } from 'typesafe-i18n';
import type { LocalizationMap } from 'discord.js';

import { locales } from '#𝕃/typesafe-i18n/i18n-util';
import { vocabAccessor } from '#𝕃/vocabAccessor';

export const buildNameLocalizationsObj = (id: SlashCommandI18nDictIdentifier): LocalizationMap =>
  Object.fromEntries(locales.map((locale) => [locale, vocabAccessor(locale).slashCommands[id].name()])) as Record<Locales, LocalizedString>;

export const buildDescriptionLocalizationsObj = (id: SlashCommandI18nDictIdentifier): LocalizationMap =>
  Object.fromEntries(locales.map((locale) => [locale, vocabAccessor(locale).slashCommands[id].description()])) as Record<Locales, LocalizedString>;
