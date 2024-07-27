import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { ModerationReason } from '@wpm-discord-bot/shared-types/String';
import type { Quantity } from '@wpm-discord-bot/shared-types/Number';
import type { Locales } from '#𝕃/typesafe-i18n/i18n-types';
import type { GuildMember } from 'discord.js';

import { prefixModerationReasonMsg } from '#@/commands/moderation/helpers/common/prefixAndShortenModerationReasonMsg';
import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import buildMagicUserId from '@wpm-discord-bot/shared-lib/portable/string/buildMagicUserId';
import { attemptToGetLanguageGuildSideOrDmSide } from '#𝕃/getLanguagePipelines';
import getUserAvatar from '@wpm-discord-bot/shared-lib/discordjs/getUserAvatar';
import surround from '@wpm-discord-bot/shared-lib/portable/string/surround';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import { EmbedBuilder } from 'discord.js';

const warnCommandEmbedScope = (locale: Locales) => vocabAccessor(locale).embeds.warnCommand;

async function warnedMemberEmbed(
  interaction: GuildInteraction,
  warnedMember: GuildMember,
  reason: ModerationReason,
  warnsAmount: Quantity
): Promise<EmbedBuilder> {
  const { MAX_WARNS_PER_MEMBER_AMOUNT } = BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.MODERATION.SANCTIONS;
  const { PRIMARY_COLOR } = BOT_APP_HARD_CODED_STATIC_CONTEXT.VISUAL_CHART.EMBEDS;

  const { user: moderator, guildId, guild } = interaction;
  const { id: moderatorId } = moderator;

  const locale = await attemptToGetLanguageGuildSideOrDmSide({
    userId: moderatorId,
    guildId
  });

  const headline = [buildMagicUserId(warnedMember.id), surround(warnedMember.id, '`')].join(' ');
  const hasBeenWarnedAmountMsg =
    warnsAmount > MAX_WARNS_PER_MEMBER_AMOUNT
      ? surround(warnCommandEmbedScope(locale).warnsAmountOverLimit({ limit: MAX_WARNS_PER_MEMBER_AMOUNT }), '**')
      : surround(warnCommandEmbedScope(locale).warnsAmount({ warnsAmount }), '**');

  const { name: guildName } = guild;

  const warnedMemberEmbed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle(warnCommandEmbedScope(locale).headline())
    .setDescription([headline, hasBeenWarnedAmountMsg, await prefixModerationReasonMsg(reason, interaction)].join('\n'))
    .setThumbnail(getUserAvatar(warnedMember));

  const magicUserId = buildMagicUserId(moderatorId);

  if (magicUserId) {
    warnedMemberEmbed.setFields([{ name: warnCommandEmbedScope(locale).reportAuthorLabel(), value: magicUserId }]);
  }

  warnedMemberEmbed.setFooter({ iconURL: guild.iconURL() ?? undefined, text: guildName });

  return warnedMemberEmbed;
}

export default warnedMemberEmbed;
