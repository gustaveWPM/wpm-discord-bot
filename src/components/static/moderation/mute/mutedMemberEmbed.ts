import type { DiscordCountdownMagic, ModerationReason } from '@wpm-discord-bot/shared-types/String';
import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
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

const muteCommandEmbedScope = (locale: Locales) => vocabAccessor(locale).embeds.muteCommand;

async function mutedMemberEmbed(
  interaction: GuildInteraction,
  mutedUser: GuildMember,
  mutesAmount: Quantity,
  countdownMagicString: DiscordCountdownMagic,
  reason: ModerationReason
): Promise<EmbedBuilder> {
  const { user: moderator, guildId, guild } = interaction;
  const { id: moderatorId } = moderator;

  const { PRIMARY_COLOR } = BOT_APP_HARD_CODED_STATIC_CONTEXT.VISUAL_CHART.EMBEDS;
  const { MAX_MUTES_PER_MEMBER_AMOUNT } = BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.MODERATION.SANCTIONS;

  const locale = await attemptToGetLanguageGuildSideOrDmSide({
    userId: moderatorId,
    guildId
  });

  const headline = [buildMagicUserId(mutedUser.id), surround(mutedUser.id, '`')].join(' ');
  const hasBeenMutedAmountMsg =
    mutesAmount > MAX_MUTES_PER_MEMBER_AMOUNT
      ? surround(muteCommandEmbedScope(locale).mutesAmountOverLimit({ limit: MAX_MUTES_PER_MEMBER_AMOUNT }), '**')
      : surround(muteCommandEmbedScope(locale).mutesAmount({ mutesAmount }), '**');

  const untilMsg = muteCommandEmbedScope(locale).until({ countdownMagicString });

  const { name: guildName } = guild;

  const mutedMemberEmbed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle(muteCommandEmbedScope(locale).headline())
    .setDescription([headline, hasBeenMutedAmountMsg, await prefixModerationReasonMsg(reason, interaction), untilMsg].join('\n'))
    .setThumbnail(getUserAvatar(mutedUser));

  const magicUserId = buildMagicUserId(moderatorId);

  if (magicUserId) {
    mutedMemberEmbed.setFields([{ name: muteCommandEmbedScope(locale).reportAuthorLabel(), value: magicUserId }]);
  }

  mutedMemberEmbed.setFooter({ iconURL: guild.iconURL() ?? undefined, text: guildName });

  return mutedMemberEmbed;
}

export default mutedMemberEmbed;
