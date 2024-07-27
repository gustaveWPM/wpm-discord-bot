import type { ExtendedClient } from '@wpm-discord-bot/shared-types/BotClient';
import type { NotDMChannel } from '@wpm-discord-bot/shared-types/Channels';
import type { GreetOptions } from '@prisma/client';
import type { Guild } from 'discord.js';

import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import lazilyFetchGuildMember from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchGuildMember';
import isChannelWithTextChat from '@wpm-discord-bot/shared-lib/discordjs/isChannelWithTextChat';
import lazilyFetchChannel from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchChannel';
import { getDiscordBotId } from '#@/client';

import { removeGreetFromDB } from './dbCalls';

const { EMOJIS } = BOT_APP_HARD_CODED_STATIC_CONTEXT.VISUAL_CHART;

export async function greetHealthcheck(
  greet: Pick<GreetOptions, 'discordChannelId' | 'discordGuildId'>,
  { client, guild }: { client: ExtendedClient; guild: Guild }
) {
  const { DELETED_AUTOMATICALLY, HEALTHCHECK_FAIL, HEALTHCHECK_PASS } = EMOJIS;

  async function deleteStaleEntryAndReturnHasFailed() {
    try {
      await removeGreetFromDB(String(greet.discordGuildId), String(greet.discordChannelId));
      return DELETED_AUTOMATICALLY;
    } catch {
      return HEALTHCHECK_FAIL;
    }
  }

  let c = await lazilyFetchChannel(String(greet.discordChannelId), client);

  if (c === null) return await deleteStaleEntryAndReturnHasFailed();

  if (!isChannelWithTextChat(c)) return HEALTHCHECK_FAIL;

  const botMember = await lazilyFetchGuildMember(guild, await getDiscordBotId());

  if (botMember === null) return HEALTHCHECK_FAIL;

  try {
    c = await c.fetch(true);
  } catch {
    return await deleteStaleEntryAndReturnHasFailed();
  }

  if (botMember.permissionsIn(c as NotDMChannel<typeof c>).has('SendMessages')) return HEALTHCHECK_PASS;

  return HEALTHCHECK_FAIL;
}
