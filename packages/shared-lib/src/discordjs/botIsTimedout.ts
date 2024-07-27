import type { NotNull } from '@wpm-discord-bot/shared-types/Utils';
import type { GuildMember } from 'discord.js';

import toUTC from '@wpm-discord-bot/shared-lib/portable/date/toUTC';

const __preparedBotIsTimedOut = (botMember: BotMemberWithCommunicationDisabledUntil) =>
  toUTC(botMember.communicationDisabledUntil) > toUTC(new Date());

const botHasTimeOutMetadatas = (botMember: GuildMember): botMember is BotMemberWithCommunicationDisabledUntil =>
  botMember.communicationDisabledUntil !== null;

const botIsTimedOut = (botMember: GuildMember): botMember is BotMemberWithCommunicationDisabledUntil =>
  botHasTimeOutMetadatas(botMember) && __preparedBotIsTimedOut(botMember);

export default botIsTimedOut;

type BotMemberWithCommunicationDisabledUntil = {
  communicationDisabledUntilTimestamp: NotNull<GuildMember['communicationDisabledUntilTimestamp']>;
  communicationDisabledUntil: NotNull<GuildMember['communicationDisabledUntil']>;
} & GuildMember;
