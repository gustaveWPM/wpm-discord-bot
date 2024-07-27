import type { ArrayElement, MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { GreetOptions } from '@prisma/client';
import type { Channel, Guild } from 'discord.js';

import tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy from '#@/db/dsl/jit/tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy';
import prisma from '#@/db/prisma';

const { greetOptions: greetOptionsPrismaTable, greetConfig: greetConfigPrismaTable } = prisma;

/**
 * @throws {PrismaClientKnownRequestError}
 */
export const countPastGreetsAmount = ({ guildId }: { guildId: Guild['id'] }) =>
  greetOptionsPrismaTable.count({
    where: {
      discordGuildId: BigInt(guildId)
    }
  });

/**
 * @throws {PrismaClientKnownRequestError}
 * CASCADE
 */
export const insertGreetInDB = async ({ channelId, guildId }: { channelId: Channel['id']; guildId: Guild['id'] }): Promise<MaybeNull<GreetOptions>> =>
  await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy({
    cb: async () => {
      const guildIdAsBigInt = BigInt(guildId);
      const channelIdAsBigInt = BigInt(channelId);

      const greetConfig = await greetConfigPrismaTable.findUnique({
        where: { discordGuildId: guildIdAsBigInt },
        select: { id: true }
      });

      if (greetConfig === null) {
        const newEntry = await greetConfigPrismaTable.create({
          data: {
            greetOptions: {
              create: {
                discordChannelId: channelIdAsBigInt,
                discordGuildId: guildIdAsBigInt
              }
            },

            discordGuild: {
              connect: { discordGuildId: guildIdAsBigInt }
            }
          },

          select: { greetOptions: true }
        });

        return newEntry.greetOptions[0] ?? null;
      }

      return await greetOptionsPrismaTable.create({
        data: {
          greetConfig: {
            connect: { id: greetConfig.id }
          },

          discordChannelId: channelIdAsBigInt,
          discordGuildId: guildIdAsBigInt
        }
      });
    },

    guildId
  });

export async function greetOptionAlreadyExists({ channelId, guildId }: { channelId: Channel['id']; guildId: Guild['id'] }) {
  const maybeGreetOption = await greetOptionsPrismaTable.findUnique({
    where: {
      discordGuildId_discordChannelId: {
        discordChannelId: BigInt(channelId),
        discordGuildId: BigInt(guildId)
      }
    },

    select: { id: true }
  });

  return maybeGreetOption !== null;
}

export const removeGreetFromDB = (guildId: Guild['id'], channelId: Channel['id']) =>
  greetOptionsPrismaTable.delete({
    where: { discordGuildId_discordChannelId: { discordChannelId: BigInt(channelId), discordGuildId: BigInt(guildId) } }
  });

export async function attemptToDeleteDbEntry(dbEntry: GreetOptions) {
  try {
    await greetOptionsPrismaTable.delete({ where: { id: dbEntry.id } });
  } catch {}
}

export const getGreetsFromDB = (guildId: Guild['id']) =>
  greetOptionsPrismaTable.findMany({
    select: {
      discordChannelId: true,
      discordGuildId: true
    },

    where: { discordGuildId: BigInt(guildId) }
  });

export type GetGreetsFromDbEntityType = ArrayElement<Awaited<ReturnType<typeof getGreetsFromDB>>>;
