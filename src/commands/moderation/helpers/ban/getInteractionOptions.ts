import type { SlashCommandI18nDictIdentifierAndOptionKeyPair } from '@wpm-discord-bot/shared-types/BotI18n';
import type { ModerationReason, TimeString } from '@wpm-discord-bot/shared-types/String';
import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { ChatInputCommandInteraction, User } from 'discord.js';

import { shortenModerationReasonMsg } from '../common/prefixAndShortenModerationReasonMsg';
import { banRequiredOptionsConfig, id } from '../../ban';

export function getBanInteractionOptions(
  interaction: ChatInputCommandInteraction,
  reasonNotSpecified: ModerationReason
): [MaybeNull<TimeString>, User, ModerationReason, MaybeNull<TimeString>] {
  const { options } = interaction;

  const [typesafeUserOptionKeyAssoc, typesafeTimeOptionKeyAssoc, typesafeReasonOptionKeyAssoc, typesafeDeleteHistoryOptionKeyAssoc] = [
    { optionKey: 'user', id } satisfies SlashCommandI18nDictIdentifierAndOptionKeyPair,
    { optionKey: 'duration', id } satisfies SlashCommandI18nDictIdentifierAndOptionKeyPair,
    { optionKey: 'reason', id } satisfies SlashCommandI18nDictIdentifierAndOptionKeyPair,
    { optionKey: 'delete-messages', id } satisfies SlashCommandI18nDictIdentifierAndOptionKeyPair
  ] as const;

  const [{ optionKey: userOptionKey }, { optionKey: durationOptionKey }, { optionKey: reasonOptionKey }, { optionKey: deleteHistoryOptionKey }] = [
    typesafeUserOptionKeyAssoc,
    typesafeTimeOptionKeyAssoc,
    typesafeReasonOptionKeyAssoc,
    typesafeDeleteHistoryOptionKeyAssoc
  ];

  const duration = options.getString(durationOptionKey, banRequiredOptionsConfig[durationOptionKey]);
  const targetMember = options.getUser(userOptionKey, banRequiredOptionsConfig[userOptionKey]);
  const deleteHistoryDurationLimit = options.getString(deleteHistoryOptionKey, banRequiredOptionsConfig[deleteHistoryOptionKey]);

  const rawReason = options.getString(reasonOptionKey, banRequiredOptionsConfig[reasonOptionKey]) ?? reasonNotSpecified;

  const reason = shortenModerationReasonMsg(rawReason, 'BannedMembers');

  return [duration, targetMember, reason, deleteHistoryDurationLimit] as const;
}
