import type { IndexedExistingMembers, NewMemberCandidate } from '../types/members';

const getExistingMemberIndex = (newMemberCandidate: NewMemberCandidate): keyof IndexedExistingMembers =>
  `${newMemberCandidate.discordUserId}_${newMemberCandidate.discordGuildId}`;

export default getExistingMemberIndex;
