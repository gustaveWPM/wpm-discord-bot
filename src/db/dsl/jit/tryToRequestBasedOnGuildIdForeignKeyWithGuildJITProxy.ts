import type { Guild } from 'discord.js';

import prisma from '#@/db/prisma';

import type { CallContext } from '../guilds/JITCreateGuild';

import JITGuildCreate from '../guilds/JITCreateGuild';

/**
 * @throws {PrismaClientKnownRequestError}
 */
async function tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy<Thunk extends __Thunk>(
  { guildId, cb }: P<Thunk>,
  callContext: CallContext = {}
): Promise<ReturnType<Thunk>> {
  const maybeDbEntry = await prisma.guild.findUnique({
    where: { discordGuildId: BigInt(guildId) },
    select: { id: true }
  });

  if (maybeDbEntry === null) await JITGuildCreate(guildId, callContext);
  return await cb();
}

export default tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy;

type P<Thunk extends __Thunk> = {
  guildId: Guild['id'];
  cb: Thunk;
};

type __Thunk = () => Promise<any>;
