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

const kickCommandEmbedScope = (locale: Locales) => vocabAccessor(locale).embeds.kickCommand;

async function kickedMemberEmbed(
  interaction: GuildInteraction,
  kickedUser: GuildMember,
  reason: ModerationReason,
  kicksAmount: Quantity
): Promise<EmbedBuilder> {
  const { user: moderator, guildId, guild } = interaction;
  const { id: moderatorId } = moderator;

  const locale = await attemptToGetLanguageGuildSideOrDmSide({
    userId: moderatorId,
    guildId
  });

  const { MAX_KICKS_PER_MEMBER_AMOUNT } = BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.MODERATION.SANCTIONS;
  const { PRIMARY_COLOR } = BOT_APP_HARD_CODED_STATIC_CONTEXT.VISUAL_CHART.EMBEDS;

  const headline = [buildMagicUserId(kickedUser.id), surround(kickedUser.id, '`')].join(' ');
  const hasBeenKickedAmountMsg =
    kicksAmount > MAX_KICKS_PER_MEMBER_AMOUNT
      ? surround(kickCommandEmbedScope(locale).kicksAmountOverLimit({ limit: MAX_KICKS_PER_MEMBER_AMOUNT }), '**')
      : surround(kickCommandEmbedScope(locale).kicksAmount({ kicksAmount }), '**');

  const { name: guildName } = guild;

  const kickedMemberEmbed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle(kickCommandEmbedScope(locale).headline())
    .setDescription([headline, hasBeenKickedAmountMsg, await prefixModerationReasonMsg(reason, interaction)].join('\n'))
    .setThumbnail(getUserAvatar(kickedUser));

  const moderatorMagicUserId = buildMagicUserId(moderatorId);

  if (moderatorMagicUserId) {
    kickedMemberEmbed.setFields([{ name: kickCommandEmbedScope(locale).reportAuthorLabel(), value: moderatorMagicUserId }]);
  }

  kickedMemberEmbed.setFooter({ iconURL: guild.iconURL() ?? undefined, text: guildName });

  return kickedMemberEmbed;
}

export default kickedMemberEmbed;
