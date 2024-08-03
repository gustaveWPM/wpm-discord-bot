import type { Limit } from '@wpm-discord-bot/shared-types/Number';
import type { GuildMember, GuildBan, User } from 'discord.js';

import { NO_USER_ID } from '@wpm-discord-bot/shared-specs/Discord';
import { AuditLogEvent } from 'discord.js';

import lazilyFetchGuildMember from './lazilyFetchGuildMember';

async function getUnbannedByMemberIdFromLogs(
  guildBan: GuildBan,
  discordBotId: User['id'],
  limit: Limit = 100
): Promise<GuildMember['id'] | typeof NO_USER_ID> {
  const botMember = await lazilyFetchGuildMember(guildBan.guild, discordBotId);

  if (botMember === null || !botMember.permissions.has('ViewAuditLog')) return NO_USER_ID;

  const auditLogs = await guildBan.guild.fetchAuditLogs({
    type: AuditLogEvent.MemberBanRemove,
    limit
  });

  const matchingLogs = auditLogs.entries.filter((log) => log.target?.id === guildBan.user.id);

  const bestMatch = matchingLogs.first();

  const bannedByMemberId = bestMatch?.executor?.id ?? NO_USER_ID;
  return bannedByMemberId;
}

export default getUnbannedByMemberIdFromLogs;
