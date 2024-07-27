import type { DiscordUserIdMagic } from '@wpm-discord-bot/shared-types/String';
import type { User } from 'discord.js';

import { NO_USER_ID } from '@wpm-discord-bot/shared-specs/Discord';

const buildMagicUserId = (userId: User['id']): DiscordUserIdMagic => (!userId ? '' : userId === NO_USER_ID ? '' : `<@${userId as `${bigint}`}>`);

export default buildMagicUserId;
