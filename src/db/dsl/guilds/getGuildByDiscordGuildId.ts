import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { Guild } from '@prisma/client';

import traceError from '#@/helpers/interactions/traceError';
import prisma from '#@/db/prisma';

async function getGuildByDiscordGuildId(guildId: Guild['id']): Promise<MaybeNull<Guild>> {
  try {
    const maybeGuild = await prisma.guild.findUnique({ where: { discordGuildId: BigInt(guildId) } });
    return maybeGuild;
  } catch (error) {
    traceError(error, { from: getGuildByDiscordGuildId.name, args: { guildId } });
    return null;
  }
}

export default getGuildByDiscordGuildId;
