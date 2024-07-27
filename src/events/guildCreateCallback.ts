import type { GuildMember, Guild } from 'discord.js';

import {
  attemptToTurnOffIsAbandonerFlagWithUnauthorizedToManageBansBotClient,
  attemptToTurnOffIsAbandonerFlagWithAuthorizedToManageBansBotClient
} from '#@/db/dsl/guilds/isAbandonerFlagTweakers';
import attemptToUpsertTimeoutOnBot from '#@/jobs/helpers/timeoutOnBot/db/attemptToUpsertTimeoutOnBot';
import lazilyFetchGuildMember from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchGuildMember';
import attemptToGetOrCreateGuild from '#@/db/dsl/guilds/attemptToGetOrCreateGuild';
import botIsTimedOut from '@wpm-discord-bot/shared-lib/discordjs/botIsTimedout';
import { attemptToForceToRecomputeIsPremium } from '#@/premium/isPremiumGuild';
import { registerCommandsOnDiscordSide, getDiscordBotId } from '#@/client';
import attemptToUpdateGuildLocale from '#𝕃/attemptToUpdateGuildLocale';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import appEnv from '#@/env/appEnv';

async function handleBotKickedAndInvitedBackToTheDevGuildAtRuntimeEdgeCase(guild: Guild) {
  if (guild.id === appEnv.DEV_GUILD_ID) {
    try {
      await registerCommandsOnDiscordSide({ log: true });
      console.log(vocabAccessor().initializers.resumingSlashCommands());
    } catch {}
  }
}

function attemptToResumeGuild(botMember: GuildMember, guild: Guild) {
  function attemptToResumeBotPermissions() {
    if (botIsTimedOut(botMember)) {
      attemptToUpsertTimeoutOnBot(guild.id, botMember.communicationDisabledUntil);
      attemptToTurnOffIsAbandonerFlagWithUnauthorizedToManageBansBotClient(guild.id);

      return;
    }

    if (botMember.permissions.has('BanMembers')) {
      attemptToTurnOffIsAbandonerFlagWithAuthorizedToManageBansBotClient(guild);
    } else {
      attemptToTurnOffIsAbandonerFlagWithUnauthorizedToManageBansBotClient(guild.id);
    }
  }

  const attemptToResumePremium = (guildId: Guild['id']) => attemptToForceToRecomputeIsPremium(guildId);

  attemptToResumeBotPermissions();
  attemptToResumePremium(guild.id);
  attemptToUpdateGuildLocale(guild);
}

async function guildCreateCallback(guild: Guild) {
  const maybeCreatedGuild = await attemptToGetOrCreateGuild(guild, {
    fromGuildCreateCallback: true
  });

  if (maybeCreatedGuild === null) return;

  const discordBotId = await getDiscordBotId();
  const botMember = await lazilyFetchGuildMember(guild, discordBotId);

  if (botMember === null) return;

  if (maybeCreatedGuild.isNew) return;

  attemptToResumeGuild(botMember, guild);

  await handleBotKickedAndInvitedBackToTheDevGuildAtRuntimeEdgeCase(guild);
}

export default guildCreateCallback;
