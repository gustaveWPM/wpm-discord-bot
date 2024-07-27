import type { GetGreetsFromDbEntityType } from '#@/commands/systems/members-onboarding/helpers/greet/dbCalls';
import type { ExtendedClient } from '@wpm-discord-bot/shared-types/BotClient';
import type { Quantity } from '@wpm-discord-bot/shared-types/Number';
import type { Guild, User } from 'discord.js';

import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import { greetHealthcheck } from '#@/commands/systems/members-onboarding/helpers/greet/greetHealthcheck';
import buildMagicChannelId from '@wpm-discord-bot/shared-lib/portable/string/buildMagicChannelId';
import { getGreetsFromDB } from '#@/commands/systems/members-onboarding/helpers/greet/dbCalls';
import { attemptToGetLanguageDmSideOrGuildSide } from '#𝕃/getLanguagePipelines';
import surround from '@wpm-discord-bot/shared-lib/portable/string/surround';
import isPremiumGuild from '#@/premium/isPremiumGuild';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import { EmbedBuilder } from 'discord.js';

async function greetInfoEmbed({ userId, client, guild }: { client: ExtendedClient; userId: User['id']; guild: Guild }) {
  const { INFORMATION_SOURCE_LOGO_URL, PRIMARY_COLOR } = BOT_APP_HARD_CODED_STATIC_CONTEXT.VISUAL_CHART.EMBEDS;
  const { MAX_GREETS_PER_GUILD_WITH_FREEMIUM, MAX_GREETS_PER_GUILD_WITH_PREMIUM } =
    BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.MEMBERS_ONBOARDING.GREET;

  const { EMOJIS } = BOT_APP_HARD_CODED_STATIC_CONTEXT.VISUAL_CHART;

  const { id: guildId } = guild;

  const locale = await attemptToGetLanguageDmSideOrGuildSide({ guildId, userId });

  const scope = vocabAccessor(locale).embeds['greet-info'];

  const greets = await getGreetsFromDB(guildId);
  const greetsAmount: Quantity = greets.length;

  const greetChannels =
    greetsAmount <= 0
      ? scope.noGreetYet()
      : greetsAmount === 1
        ? [
            await greetHealthcheck(greets[0] as GetGreetsFromDbEntityType, {
              client,
              guild
            }),
            buildMagicChannelId(String((greets[0] as GetGreetsFromDbEntityType).discordChannelId))
          ].join(' ')
        : (
            await Promise.all(
              greets.map(
                async (greet, idx) =>
                  `${idx + 1}` + '. ' + (await greetHealthcheck(greet, { client, guild })) + ' ' + buildMagicChannelId(String(greet.discordChannelId))
              )
            )
          ).join('\n');

  const description = (await isPremiumGuild(guildId))
    ? greetChannels
    : [
        greetChannels,
        '\n' +
          `${EMOJIS.PREMIUM_CTA} ` +
          surround(
            greetsAmount <= MAX_GREETS_PER_GUILD_WITH_FREEMIUM
              ? scope.premiumAd({
                  premiumMaxGreetsAmount: MAX_GREETS_PER_GUILD_WITH_PREMIUM
                })
              : scope.premiumRenewal({
                  premiumMaxGreetsAmount: MAX_GREETS_PER_GUILD_WITH_PREMIUM
                }),
            '**'
          )
      ].join('\n');

  const embed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle(scope.title())
    .setDescription(description)
    .setThumbnail(guild.iconURL() ?? INFORMATION_SOURCE_LOGO_URL);

  return embed;
}

export default greetInfoEmbed;
