import type { ChatInputCommandInteraction, StringSelectMenuInteraction } from 'discord.js';
import type { Locales } from '#𝕃/typesafe-i18n/i18n-types';

import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import { attemptToGetLanguageGuildSideOrDmSide } from '#𝕃/getLanguagePipelines';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import { EmbedBuilder } from 'discord.js';

const defaultViewScope = (locale: Locales) => vocabAccessor(locale).embeds.helpCommand.views.defaultView;

async function helpCommandEmbedDefaultView(interaction: ChatInputCommandInteraction | StringSelectMenuInteraction) {
  const { DISCORD_SERVER_INVITE_LINK } = BOT_APP_HARD_CODED_STATIC_CONTEXT.COMMUNITY;
  const { FOOTER_LOGO_URL, TITLE_LOGO_URL, PRIMARY_COLOR } = BOT_APP_HARD_CODED_STATIC_CONTEXT.VISUAL_CHART.EMBEDS;
  const { BANNER_URL } = BOT_APP_HARD_CODED_STATIC_CONTEXT.EMBEDS.HELP_COMMAND.VIEWS.DEFAULT;

  const { guildId, user } = interaction;
  const { id: userId } = user;

  const locale = await attemptToGetLanguageGuildSideOrDmSide({
    guildId,
    userId
  });

  const helpCommandEmbed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setAuthor({
      name: vocabAccessor(locale).vocab.discordBotName(),
      url: DISCORD_SERVER_INVITE_LINK,
      iconURL: TITLE_LOGO_URL
    })
    .setTitle(defaultViewScope(locale).title())
    .setURL(DISCORD_SERVER_INVITE_LINK)
    .setDescription(defaultViewScope(locale).description())
    .setImage(BANNER_URL)
    .setFooter({ text: vocabAccessor(locale).embeds.commons.footerText(), iconURL: FOOTER_LOGO_URL });

  return helpCommandEmbed;
}

export default helpCommandEmbedDefaultView;
