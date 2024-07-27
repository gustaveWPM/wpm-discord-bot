import type { Guild } from 'discord.js';

import { attemptToTurnOnIsAbandonerFlag } from '#@/db/dsl/guilds/isAbandonerFlagTweakers';

const guildDeleteCallback = (guild: Guild) => attemptToTurnOnIsAbandonerFlag(guild.id);

export default guildDeleteCallback;
