import type { IndexedExistingMembers, NewMemberCandidate } from '../types/members';

const getExistingMemberIndex = ({ discordGuildId, discordUserId }: NewMemberCandidate): keyof IndexedExistingMembers =>
  `${discordUserId}_${discordGuildId}`;

export default getExistingMemberIndex;
