import type { IndexedExistingMembers, ExistingMember } from '../types/members';

import getExistingMemberIndex from './getExistingMemberIndex';

const indexExistingMembers = (existingMembers: ExistingMember[]) =>
  Object.fromEntries(existingMembers.map((member) => [getExistingMemberIndex(member), member])) as IndexedExistingMembers;

export default indexExistingMembers;
