import type { Guild, Role } from 'discord.js';

const isEveryoneRole = (roleId: Role['id'], guildId: Guild['id']) => roleId === guildId;

export default isEveryoneRole;
