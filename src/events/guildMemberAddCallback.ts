import type { ExtendedClient } from '@wpm-discord-bot/shared-types/BotClient';
import type { NotDMChannel } from '@wpm-discord-bot/shared-types/Channels';
import type { GuildMember } from 'discord.js';

import attemptToSendMessageInChannel from '@wpm-discord-bot/shared-lib/discordjs/attemptToSendMessageInChannel';
import lazilyFetchGuildMember from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchGuildMember';
import attemptToDeleteMessage from '@wpm-discord-bot/shared-lib/discordjs/attemptToDeleteMessage';
import { removeGreetFromDB } from '#@/commands/systems/members-onboarding/helpers/greet/dbCalls';
import isChannelWithTextChat from '@wpm-discord-bot/shared-lib/discordjs/isChannelWithTextChat';
import buildMagicUserId from '@wpm-discord-bot/shared-lib/portable/string/buildMagicUserId';
import lazilyFetchChannel from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchChannel';
import { attemptToGetLanguageGuildSideOrDmSide } from '#𝕃/getLanguagePipelines';
import { MISSING_ACCESS } from '@wpm-discord-bot/shared-specs/Discord';
import traceError from '#@/helpers/interactions/traceError';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import { DiscordAPIError } from 'discord.js';
import { getDiscordBotId } from '#@/client';
import prisma from '#@/db/prisma';

async function attemptToGreetNewMember(newMember: GuildMember) {
  if (newMember.user.bot) return;

  const { id: newMemberId, client, guild } = newMember;
  const { id: guildId } = guild;

  const discordBotId = await getDiscordBotId();
  const botMember = await lazilyFetchGuildMember(guild, discordBotId);

  if (botMember === null) return;

  try {
    const greetOptions = await prisma.greetOptions.findMany({
      where: {
        greetConfig: {
          discordGuildId: BigInt(guildId)
        }
      },

      select: {
        discordChannelId: true,
        discordGuildId: true
      }
    });

    for (const greetOption of greetOptions) {
      const maybeChannel = await lazilyFetchChannel(String(greetOption.discordChannelId), client as ExtendedClient);

      if (maybeChannel === null) {
        await removeGreetFromDB(guildId, String(greetOption.discordChannelId));
        continue;
      }

      if (!isChannelWithTextChat(maybeChannel)) continue;

      if (!botMember.permissionsIn(maybeChannel as NotDMChannel<typeof maybeChannel>).has('SendMessages')) continue;

      const res = await attemptToSendMessageInChannel(maybeChannel, {
        content: vocabAccessor(await attemptToGetLanguageGuildSideOrDmSide({ userId: newMemberId, guildId })).pushNotifications.greet({
          memberIdMagicString: buildMagicUserId(newMemberId)
        })
      });

      if (res.successCtx) {
        attemptToDeleteMessage(res.successCtx);
      } else if (res.failureCtx) {
        if (res.failureCtx instanceof DiscordAPIError && res.failureCtx.code === MISSING_ACCESS) {
          await removeGreetFromDB(guildId, String(greetOption.discordChannelId));
          continue;
        }

        traceError(res.failureCtx, { from: attemptToGreetNewMember.name, ctx: { newMemberId, guildId } });
      }
    }
  } catch (error) {
    traceError(error, { from: attemptToGreetNewMember.name, ctx: { newMemberId, guildId } });
  }
}

function guildMemberAddCallback(newMember: GuildMember) {
  attemptToGreetNewMember(newMember);
}

export default guildMemberAddCallback;
