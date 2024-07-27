import type { IndexedExistingMembers, NewMemberCandidate } from './types/members';

import getExistingMemberIndex from './utils/getExistingMemberIndex';

function shouldMoveMember(newMemberCandidate: NewMemberCandidate, indexedExistingMembers: IndexedExistingMembers): boolean {
  const conflictMember = indexedExistingMembers[getExistingMemberIndex(newMemberCandidate)];

  const noConflictFound = conflictMember === undefined;
  if (noConflictFound) return true;

  const hasLongerBan = newMemberCandidate.until !== null && conflictMember.until !== null && newMemberCandidate.until > conflictMember.until;
  if (hasLongerBan) return true;

  const hasMoreRecentBan = newMemberCandidate.until === conflictMember.until && newMemberCandidate.bannedAt > conflictMember.bannedAt;
  if (hasMoreRecentBan) return true;

  return false;
}

export default shouldMoveMember;
