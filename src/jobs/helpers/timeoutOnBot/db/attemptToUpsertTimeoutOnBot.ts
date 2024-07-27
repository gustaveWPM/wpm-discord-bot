import type { Guild } from 'discord.js';

import tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy from '#@/db/dsl/jit/tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy';
import toUTC from '@wpm-discord-bot/shared-lib/portable/date/toUTC';
import verrou, { verrouKeysFactory } from '#@/config/verrou';
import traceError from '#@/helpers/interactions/traceError';
import prisma from '#@/db/prisma';

async function attemptToUpsertTimeoutOnBot(guildId: Guild['id'], untilDate: Date) {
  try {
    await verrou
      .use('redis')
      .createLock(verrouKeysFactory.HANDLE_TEMP_BANS_JOB_LOCK_KEYS.attemptToUpdateTimeoutOnBot(guildId), '1m')
      .run(async () => {
        try {
          await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy({
            cb: async () => {
              const guildIdAsBigInt = BigInt(guildId);
              const untilUTC = toUTC(untilDate);

              return await prisma.botGotTimedOutOnGuilds.upsert({
                create: {
                  discordGuildId: guildIdAsBigInt,
                  until: untilUTC
                },

                where: { discordGuildId: guildIdAsBigInt },
                update: { until: untilUTC }
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

export default attemptToUpsertTimeoutOnBot;
