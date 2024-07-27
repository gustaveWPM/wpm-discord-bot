import type { ChatInputCommandInteraction, StringSelectMenuInteraction } from 'discord.js';
import type { GlobalSlashCommandMagicString } from '#@/types/SlashCommand';
import type { Couple } from '@wpm-discord-bot/shared-types/Utils';
import type { Locales } from '#𝕃/typesafe-i18n/i18n-types';
import type { LocalizedString } from 'typesafe-i18n';

import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import { buildGlobalSlashCommandMagicString } from '#@/lib/str/buildSlashCommandMagicString';
import { attemptToGetLanguageGuildSideOrDmSide } from '#𝕃/getLanguagePipelines';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import { EmbedBuilder } from 'discord.js';

const { EMOJIS } = BOT_APP_HARD_CODED_STATIC_CONTEXT.VISUAL_CHART;

const helpCommandEmbedScope = (locale: Locales) => vocabAccessor(locale).embeds.helpCommand;

const [hl, d] = [buildGlobalSlashCommandMagicString, (l: Locales) => helpCommandEmbedScope(l).views.moderation.content.commands];

// NOTE: be careful with the order of the commands, everywhere. Here and in all the following patterns matching.
const HLandDescriptionsCouplesMapping = (l: Locales) =>
  [
    [hl('warn'), d(l).warn.description()],
    [hl('mute'), d(l).mute.description()],
    [hl('kick'), d(l).kick.description()],
    [hl('ban'), d(l).ban.description()]
  ] as const satisfies Couple<GlobalSlashCommandMagicString, LocalizedString>[];

async function helpCommandEmbedModerationView(interaction: ChatInputCommandInteraction | StringSelectMenuInteraction) {
  const { DISCORD_SERVER_INVITE_LINK } = BOT_APP_HARD_CODED_STATIC_CONTEXT.COMMUNITY;
  const { FOOTER_LOGO_URL, TITLE_LOGO_URL, PRIMARY_COLOR } = BOT_APP_HARD_CODED_STATIC_CONTEXT.VISUAL_CHART.EMBEDS;
  const { THUMBNAIL_URL } = BOT_APP_HARD_CODED_STATIC_CONTEXT.EMBEDS.HELP_COMMAND.VIEWS.MODERATION;

  const { guildId, user } = interaction;
  const { id: userId } = user;

  const locale = await attemptToGetLanguageGuildSideOrDmSide({
    guildId,
    userId
  });

  const [[warnHL, warnDescription], [muteHL, muteDescription], [kickHL, kickDescription], [banHL, banDescription]] =
    HLandDescriptionsCouplesMapping(locale);

  const [formattedWarnHL, formattedMuteHL, formattedKickHL, formattedBanHL] = [warnHL, muteHL, kickHL, banHL].map(
    (s) => `- ${EMOJIS.MODERATION_COMMAND} ` + s
  );

  const [formattedWarnDescription, formattedMuteDescription, formattedKickDescription, formattedBanDescription] = [
    warnDescription,
    muteDescription,
    kickDescription,
    banDescription
  ].map((s) => '> ' + s.replace(/\n/g, '\n> '));

  const description = [
    formattedWarnHL,
    formattedWarnDescription,
    formattedMuteHL,
    formattedMuteDescription,
    formattedKickHL,
    formattedKickDescription,
    formattedBanHL,
    formattedBanDescription,
    helpCommandEmbedScope(locale).views.moderation.content.trailingTrivia()
  ].join('\n');

  const helpCommandModerationViewEmbed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setAuthor({
      name: vocabAccessor(locale).vocab.discordBotName(),
      url: DISCORD_SERVER_INVITE_LINK,
      iconURL: TITLE_LOGO_URL
    })
    .setThumbnail(THUMBNAIL_URL)
    .setTitle(helpCommandEmbedScope(locale).views.moderation.title())
    .setURL(DISCORD_SERVER_INVITE_LINK)
    .setDescription(description)
    .setFooter({ text: vocabAccessor(locale).embeds.commons.footerText(), iconURL: FOOTER_LOGO_URL });

  return helpCommandModerationViewEmbed;
}

export default helpCommandEmbedModerationView;
