import type { GuildWithIsNewTag } from '@wpm-discord-bot/shared-types/Database';
import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { Guild as DbEntryGuild } from '@prisma/client';
import type { Guild } from 'discord.js';

import lazilyFetchGuildMember from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchGuildMember';
import bentocache, { bentocacheKeysFactory } from '#@/config/bentocache';
import attemptToUpdateGuildLocale from '#𝕃/attemptToUpdateGuildLocale';
import traceError from '#@/helpers/interactions/traceError';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import { getDiscordBotId } from '#@/client';

import type { CallContext } from './JITCreateGuild';

import {
  attemptToTurnOffIsAbandonerFlagWithUnauthorizedToManageBansBotClient,
  attemptToTurnOffIsAbandonerFlagWithAuthorizedToManageBansBotClient,
  attemptToTurnOnIsAbandonerFlag
} from './isAbandonerFlagTweakers';
import getGuildByDiscordGuildId from './getGuildByDiscordGuildId';
import createGuild from './createGuild';

async function attemptToHotReloadGuild(guildInDB: DbEntryGuild, guild: Guild) {
  const guildId = String(guildInDB.discordGuildId);

  try {
    // NOTE: lol DoS
    await bentocache.use('multitier').getOrSet(
      bentocacheKeysFactory.guildHotReloadedRecently(guildId),
      async () => {
        const discordBotId = await getDiscordBotId();
        const botMember = await lazilyFetchGuildMember(guild, discordBotId);

        if (botMember === null) {
          attemptToTurnOnIsAbandonerFlag(guildId);
          return;
        }

        if (botMember.permissions.has('BanMembers')) {
          attemptToTurnOffIsAbandonerFlagWithAuthorizedToManageBansBotClient(guild);
        } else {
          attemptToTurnOffIsAbandonerFlagWithUnauthorizedToManageBansBotClient(guildId);
        }

        attemptToUpdateGuildLocale(guild);

        return true;
      },

      { gracePeriod: { enabled: false }, ttl: '6h' }
    );
  } catch (error) {
    traceError(error, { from: attemptToHotReloadGuild.name, ctx: { guildId } });
  }
}

async function attemptToGetOrCreateGuild(guild: Guild, callContext: CallContext = {}): Promise<MaybeNull<GuildWithIsNewTag>> {
  const { preferredLocale, id: guildId } = guild;

  try {
    const maybeExistingGuildInDB = await getGuildByDiscordGuildId(guildId);

    if (maybeExistingGuildInDB !== null) {
      if (!callContext.fromAttemptToTurnOffIsAbandonerFlag && !callContext.fromGuildCreateCallback) {
        attemptToHotReloadGuild(maybeExistingGuildInDB, guild);
      }

      return { guild: maybeExistingGuildInDB, isNew: false };
    }

    const newGuild = await createGuild(guildId, preferredLocale);

    if (newGuild === null) {
      throw new Error(vocabAccessor().errors.attemptToGetOrCreateGuild.bothFailedToRetrieveAnExistingGuildAndToCreateANewGuild());
    }

    return { guild: newGuild, isNew: true };
  } catch (error) {
    traceError(error, { from: attemptToGetOrCreateGuild.name, ctx: { preferredLocale, guildId } });

    return null;
  }
}

export default attemptToGetOrCreateGuild;
