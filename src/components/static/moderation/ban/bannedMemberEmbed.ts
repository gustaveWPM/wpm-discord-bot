import type { DiscordCountdownMagic, ModerationReason } from '@wpm-discord-bot/shared-types/String';
import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { Quantity } from '@wpm-discord-bot/shared-types/Number';
import type { Locales } from '#𝕃/typesafe-i18n/i18n-types';
import type { GuildMember, User } from 'discord.js';

import { prefixModerationReasonMsg } from '#@/commands/moderation/helpers/common/prefixAndShortenModerationReasonMsg';
import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import buildMagicUserId from '@wpm-discord-bot/shared-lib/portable/string/buildMagicUserId';
import { attemptToGetLanguageGuildSideOrDmSide } from '#𝕃/getLanguagePipelines';
import getUserAvatar from '@wpm-discord-bot/shared-lib/discordjs/getUserAvatar';
import surround from '@wpm-discord-bot/shared-lib/portable/string/surround';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import { EmbedBuilder } from 'discord.js';

const bannedCommandEmbedScope = (locale: Locales) => vocabAccessor(locale).embeds.banCommand;

async function bannedMemberEmbed({
  countdownMagicString,
  interaction,
  bansAmount,
  bannedUser,
  reason
}: {
  countdownMagicString?: DiscordCountdownMagic;
  bannedUser: GuildMember | User;
  interaction: GuildInteraction;
  reason: ModerationReason;
  bansAmount: Quantity;
}): Promise<EmbedBuilder> {
  const { user: moderator, guildId, guild } = interaction;
  const { id: moderatorId } = moderator;

  const { PRIMARY_COLOR } = BOT_APP_HARD_CODED_STATIC_CONTEXT.VISUAL_CHART.EMBEDS;
  const { MAX_BANS_PER_USER_AMOUNT } = BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.MODERATION.SANCTIONS;

  const locale = await attemptToGetLanguageGuildSideOrDmSide({
    userId: moderatorId,
    guildId
  });

  const headline = [buildMagicUserId(bannedUser.id), surround(bannedUser.id, '`')].join(' ');
  const hasBeenBannedAmountMsg =
    bansAmount > MAX_BANS_PER_USER_AMOUNT
      ? surround(bannedCommandEmbedScope(locale).bansAmountOverLimit({ limit: MAX_BANS_PER_USER_AMOUNT }), '**')
      : surround(bannedCommandEmbedScope(locale).bansAmount({ bansAmount }), '**');

  const untilMsg = countdownMagicString !== undefined ? bannedCommandEmbedScope(locale).until({ countdownMagicString }) : '';

  const { name: guildName } = guild;

  const bannedMemberEmbed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle(bannedCommandEmbedScope(locale).headline())
    .setDescription(
      [headline, hasBeenBannedAmountMsg, await prefixModerationReasonMsg(reason, interaction), untilMsg].filter((s) => s !== '').join('\n')
    )
    .setThumbnail(getUserAvatar(bannedUser));

  const magicUserId = buildMagicUserId(moderatorId);

  if (magicUserId) {
    bannedMemberEmbed.setFields([{ name: bannedCommandEmbedScope(locale).reportAuthorLabel(), value: magicUserId }]);
  }

  bannedMemberEmbed.setFooter({ iconURL: guild.iconURL() ?? undefined, text: guildName });

  return bannedMemberEmbed;
}

export default bannedMemberEmbed;
