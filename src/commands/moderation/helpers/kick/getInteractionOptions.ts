import type { SlashCommandI18nDictIdentifierAndOptionKeyPair } from '@wpm-discord-bot/shared-types/BotI18n';
import type { ModerationReason } from '@wpm-discord-bot/shared-types/String';
import type { ChatInputCommandInteraction, User } from 'discord.js';
import type { Couple } from '@wpm-discord-bot/shared-types/Utils';

import { shortenModerationReasonMsg } from '../common/prefixAndShortenModerationReasonMsg';
import { kickRequiredOptionsConfig, id } from '../../kick';

export function getKickInteractionOptions(
  interaction: ChatInputCommandInteraction,
  reasonNotSpecified: ModerationReason
): Couple<User, ModerationReason> {
  const { options } = interaction;

  const [typesafeMemberOptionKeyAssoc, typesafeReasonOptionKeyAssoc] = [
    { optionKey: 'member', id } satisfies SlashCommandI18nDictIdentifierAndOptionKeyPair,
    { optionKey: 'reason', id } satisfies SlashCommandI18nDictIdentifierAndOptionKeyPair
  ] as const;

  const [{ optionKey: memberOptionKey }, { optionKey: reasonOptionKey }] = [typesafeMemberOptionKeyAssoc, typesafeReasonOptionKeyAssoc];

  const targetMember = options.getUser(memberOptionKey, kickRequiredOptionsConfig[memberOptionKey]);
  const rawReason = options.getString(reasonOptionKey, kickRequiredOptionsConfig[reasonOptionKey]) ?? reasonNotSpecified;

  const reason = shortenModerationReasonMsg(rawReason, 'KickedMembers');

  return [targetMember, reason] as const;
}
