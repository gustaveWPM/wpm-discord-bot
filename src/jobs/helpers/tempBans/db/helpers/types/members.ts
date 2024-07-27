import type { BannedMembersArchive } from '@prisma/client';

export type NewMemberCandidate = Pick<BannedMembersArchive, 'discordGuildId' | 'discordUserId' | 'bannedAt' | 'until'>;
export type ExistingMember = NewMemberCandidate;

export type IndexedExistingMembers = Record<`${NewMemberCandidate['discordUserId']}_${NewMemberCandidate['discordGuildId']}`, ExistingMember>;
