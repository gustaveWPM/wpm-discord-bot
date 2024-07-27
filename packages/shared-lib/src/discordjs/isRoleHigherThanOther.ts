import type { Role } from 'discord.js';

const isRoleHigherThanOther = (role1: Role, role2: Role) => role1.rawPosition > role2.rawPosition;

export default isRoleHigherThanOther;
