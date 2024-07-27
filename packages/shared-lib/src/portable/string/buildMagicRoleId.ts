import type { DiscordRoleIdMagic } from '@wpm-discord-bot/shared-types/String';
import type { Role } from 'discord.js';

const buildMagicUserId = (roleId: Role['id']): DiscordRoleIdMagic => (!roleId ? '' : `<@&${roleId as `${bigint}`}>`);

export default buildMagicUserId;
