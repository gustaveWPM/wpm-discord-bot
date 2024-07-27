import type { Guild } from 'discord.js';

import tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy from '#@/db/dsl/jit/tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy';
import verrou, { verrouKeysFactory } from '#@/config/verrou';
import traceError from '#@/helpers/interactions/traceError';
import prisma from '#@/db/prisma';

async function attemptToDeleteTimeoutOnBot(guildId: Guild['id']) {
  try {
    await verrou
      .use('redis')
      .createLock(verrouKeysFactory.HANDLE_TEMP_BANS_JOB_LOCK_KEYS.attemptToUpdateTimeoutOnBot(guildId), '1m')
      .run(async () => {
        try {
          await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy({
            cb: async () => {
              // NOTE: https://github.com/prisma/prisma/issues/9460#issuecomment-2203509461

              const maybeTimeoutOnBot = await prisma.botGotTimedOutOnGuilds.findUnique({
                where: {
                  discordGuildId: BigInt(guildId)
                },

                select: { id: true }
              });

              if (maybeTimeoutOnBot === null) return;

              return await prisma.botGotTimedOutOnGuilds.delete({
                where: { discordGuildId: BigInt(guildId) }
              });
            },

            guildId
          });
        } catch (error) {
          traceError(error);
        }
      });
  } catch {}
}

export default attemptToDeleteTimeoutOnBot;
