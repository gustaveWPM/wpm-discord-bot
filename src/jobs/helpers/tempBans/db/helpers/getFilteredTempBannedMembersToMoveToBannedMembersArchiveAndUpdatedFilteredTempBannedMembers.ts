import type { Couple } from '@wpm-discord-bot/shared-types/Utils';
import type { TempBannedMembers } from '@prisma/client';
import type { User } from 'discord.js';

function getFilteredTempBannedMembersToMoveToBannedMembersArchiveAndUpdatedFilteredTempBannedMembers(
  filteredTempBannedMembersAbandoners: TempBannedMembers[],
  currentBannedMembersIds: Set<User['id']>
): Couple<TempBannedMembers[]> {
  const filteredTempBannedMembersToMoveToBannedMembersArchive = filteredTempBannedMembersAbandoners.filter(
    (member) => !currentBannedMembersIds.has(String(member.discordUserId))
  );

  const updatedFilteredTempBannedMembers = filteredTempBannedMembersAbandoners.filter((member) =>
    currentBannedMembersIds.has(String(member.discordUserId))
  );

  return [filteredTempBannedMembersToMoveToBannedMembersArchive, updatedFilteredTempBannedMembers];
}

export default getFilteredTempBannedMembersToMoveToBannedMembersArchiveAndUpdatedFilteredTempBannedMembers;
