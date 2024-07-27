import type { CustomInviteLinkUserInput } from '@wpm-discord-bot/shared-types/String';
import type { SlashCommand } from '@wpm-discord-bot/shared-types/BotI18nSchema';
import type { Index } from '@wpm-discord-bot/shared-types/Number';
import type { Locales } from '#𝕃/typesafe-i18n/i18n-types';

import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import surround from '@wpm-discord-bot/shared-lib/portable/string/surround';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import { EmbedBuilder } from 'discord.js';

const { EMOJIS } = BOT_APP_HARD_CODED_STATIC_CONTEXT.VISUAL_CHART;

function vanityConfigHelpEmbed(callContext: CallContext): EmbedBuilder {
  const { DISCORD_SERVER_INVITE_LINK } = BOT_APP_HARD_CODED_STATIC_CONTEXT.COMMUNITY;
  const { INFORMATION_SOURCE_LOGO_URL, FOOTER_LOGO_URL, TITLE_LOGO_URL, PRIMARY_COLOR } = BOT_APP_HARD_CODED_STATIC_CONTEXT.VISUAL_CHART.EMBEDS;

  const { customInviteLinkUserInput: vanityCode, commandName, option, locale } = callContext;

  const examples = vocabAccessor(locale).tutorials.usage.vanityConfig.examples.needle.gist();
  const additionalInformations = vocabAccessor(locale).tutorials.usage.vanityConfig.examples.needle.additionalInformations();

  const useCaseLine = vocabAccessor(locale).tutorials.usecase({ commandName, option });

  const withLine = [
    vocabAccessor(locale).tutorials.usage.vanityConfig.informationEmbed.with({ vanityCode }),
    surround(`${EMOJIS.ARROW_UPPER_RIGHT} ` + vocabAccessor(locale).vocab.thisValueIsIncorrect(), '**')
  ].join('\n');

  const examplesHeadline = `### ${EMOJIS.EXAMPLES} ` + vocabAccessor(locale).tutorials.examplesHeadline();

  const additionalInformationsHeadline = `### ${EMOJIS.GOOD_TO_KNOW} ` + vocabAccessor(locale).tutorials.goodToKnowHeadline();

  const [formattedExamples, formattedAdditionalInformations] = [examples, additionalInformations]
    .filter((s) => s !== '')
    .map((s) => '- ' + s.replace(/\n/g, '\n- '));

  const description = [useCaseLine, withLine, examplesHeadline, formattedExamples, additionalInformationsHeadline, formattedAdditionalInformations]
    .filter((s) => s !== '')
    .join('\n');

  const durationValueHelpEmbed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle(vocabAccessor(locale).tutorials.usage.vanityConfig.informationEmbed.title())
    .setAuthor({
      name: vocabAccessor(locale).tutorials.helpTitle(),
      url: DISCORD_SERVER_INVITE_LINK,
      iconURL: TITLE_LOGO_URL
    })
    .setDescription(description)
    .setThumbnail(INFORMATION_SOURCE_LOGO_URL)
    .setFooter({
      text: vocabAccessor(locale).embeds.commons.footerText(),
      iconURL: FOOTER_LOGO_URL
    });

  return durationValueHelpEmbed;
}

export default vanityConfigHelpEmbed;

type CallContext = {
  customInviteLinkUserInput: CustomInviteLinkUserInput;
  option: SlashCommand['options'][Index]['name'];
  commandName: SlashCommand['name'];
  locale: Locales;
};
