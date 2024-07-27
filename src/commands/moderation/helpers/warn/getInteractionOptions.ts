import type { SlashCommandI18nDictIdentifierAndOptionKeyPair } from '@wpm-discord-bot/shared-types/BotI18n';
import type { ModerationReason } from '@wpm-discord-bot/shared-types/String';
import type { ChatInputCommandInteraction, User } from 'discord.js';
import type { Couple } from '@wpm-discord-bot/shared-types/Utils';

import { attemptToGetLanguageGuildSide } from '#𝕃/getLanguagePipelines';
import { vocabAccessor } from '#𝕃/vocabAccessor';

import { shortenModerationReasonMsg } from '../common/prefixAndShortenModerationReasonMsg';
import { warnRequiredOptionsConfig, id } from '../../warn';

export async function getWarnInteractionOptions(interaction: ChatInputCommandInteraction): Promise<Couple<User, ModerationReason>> {
  const { options, guildId } = interaction;

  const [typesafeMemberOptionKeyAssoc, typesafeReasonOptionKeyAssoc] = [
    { optionKey: 'member', id } satisfies SlashCommandI18nDictIdentifierAndOptionKeyPair,
    { optionKey: 'reason', id } satisfies SlashCommandI18nDictIdentifierAndOptionKeyPair
  ];

  const [{ optionKey: targetMemberOptionKey }, { optionKey: reasonOptionKey }] = [typesafeMemberOptionKeyAssoc, typesafeReasonOptionKeyAssoc];

  const targetMember = options.getUser(targetMemberOptionKey, warnRequiredOptionsConfig[targetMemberOptionKey]);
  const rawReason =
    options.getString(reasonOptionKey, warnRequiredOptionsConfig[reasonOptionKey]) ??
    vocabAccessor(await attemptToGetLanguageGuildSide(guildId)).vocab.reasonNotSpecified();

  const reason = shortenModerationReasonMsg(rawReason, 'WarnedMembers');

  return [targetMember, reason] as const;
}
