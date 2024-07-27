import type { SlashCommandI18nDictIdentifierAndOptionKeyPair } from '@wpm-discord-bot/shared-types/BotI18n';
import type { ModerationReason, TimeString } from '@wpm-discord-bot/shared-types/String';
import type { ChatInputCommandInteraction, User } from 'discord.js';

import { shortenModerationReasonMsg } from '../common/prefixAndShortenModerationReasonMsg';
import { muteRequiredOptionsConfig, id } from '../../mute';

export function getMuteInteractionOptions(
  interaction: ChatInputCommandInteraction,
  reasonNotSpecified: ModerationReason
): [TimeString, User, ModerationReason] {
  const { options } = interaction;

  const [typesafeMemberOptionKeyAssoc, typesafeTimeOptionKeyAssoc, typesafeReasonOptionKeyAssoc] = [
    { optionKey: 'member', id } satisfies SlashCommandI18nDictIdentifierAndOptionKeyPair,
    { optionKey: 'duration', id } satisfies SlashCommandI18nDictIdentifierAndOptionKeyPair,
    { optionKey: 'reason', id } satisfies SlashCommandI18nDictIdentifierAndOptionKeyPair
  ] as const;

  const [{ optionKey: memberOptionKey }, { optionKey: durationOptionKey }, { optionKey: reasonOptionKey }] = [
    typesafeMemberOptionKeyAssoc,
    typesafeTimeOptionKeyAssoc,
    typesafeReasonOptionKeyAssoc
  ];

  const duration = options.getString(durationOptionKey, muteRequiredOptionsConfig[durationOptionKey]);
  const targetMember = options.getUser(memberOptionKey, muteRequiredOptionsConfig[memberOptionKey]);
  const rawReason = options.getString(reasonOptionKey, muteRequiredOptionsConfig[reasonOptionKey]) ?? reasonNotSpecified;

  const reason = shortenModerationReasonMsg(rawReason, 'MutedMembers');

  return [duration, targetMember, reason] as const;
}
