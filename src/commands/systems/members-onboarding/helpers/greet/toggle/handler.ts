import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { ExtendedClient } from '@wpm-discord-bot/shared-types/BotClient';
import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { GreetOptions } from '@prisma/client';
import type { Channel } from 'discord.js';

import attemptToSendMessageInChannel from '@wpm-discord-bot/shared-lib/discordjs/attemptToSendMessageInChannel';
import attemptToDeleteMessage from '@wpm-discord-bot/shared-lib/discordjs/attemptToDeleteMessage';
import isChannelWithTextChat from '@wpm-discord-bot/shared-lib/discordjs/isChannelWithTextChat';
import buildMagicUserId from '@wpm-discord-bot/shared-lib/portable/string/buildMagicUserId';
import isPremiumGuild from '#@/premium/isPremiumGuild';

import {
  greetOptionAlreadyExists,
  attemptToDeleteDbEntry,
  countPastGreetsAmount,
  removeGreetFromDB,
  insertGreetInDB,
  getGreetsFromDB
} from '../dbCalls';
import { attemptToSendGreetRemovedEphemeral, attemptToSendGreetAddedEphemeral } from '../feedback/addFeatureFeedbacks';
import isAuthorizedToCreateNewGreetWithCurrentPlan from '../validators/isAuthorizedToCreateNewGreetWithCurrentPlan';
import { greetUnhappyPathsMatchingEffects } from '../errors/greetUnhappyPathsMatchingEffects';
import getMaybeTargetChannel from './getMaybeTargetChannel';
import { greetHealthcheck } from '../greetHealthcheck';
import failedToInteract from '../failedToInteract';
import { EGreetMisusages } from '../enums';

export async function toggleHandler(interaction: GuildInteraction) {
  const maybeChannel = getMaybeTargetChannel(interaction);

  if (maybeChannel === null || !isChannelWithTextChat(maybeChannel as Channel)) {
    failedToInteract(interaction);
    return;
  }

  const { guildId, client, guild, user } = interaction;
  const { id: userId } = user;
  const { id: channelId } = maybeChannel;

  await interaction.deferReply({ ephemeral: true });

  let dbEntry: MaybeNull<GreetOptions> = null;

  try {
    const alreadyExists = await greetOptionAlreadyExists({ channelId, guildId });
    if (alreadyExists) {
      await removeGreetFromDB(guildId, channelId);
      attemptToSendGreetRemovedEphemeral(interaction, maybeChannel.id);
      return;
    }

    const greets = await getGreetsFromDB(guildId);
    await Promise.all(
      greets.map(
        async (greet) =>
          await greetHealthcheck(greet, {
            client: client as ExtendedClient,
            guild
          })
      )
    );

    const [count, isPremium] = await Promise.all([countPastGreetsAmount({ guildId }), isPremiumGuild(guildId)]);

    const authorizedToCreateNewGreet = isAuthorizedToCreateNewGreetWithCurrentPlan(isPremium, count);

    if (authorizedToCreateNewGreet !== EGreetMisusages.OK) {
      greetUnhappyPathsMatchingEffects[authorizedToCreateNewGreet](interaction);
      return;
    }

    const res = await attemptToSendMessageInChannel(maybeChannel, { content: buildMagicUserId(userId) });
    if (res.failureCtx !== undefined) {
      greetUnhappyPathsMatchingEffects[EGreetMisusages.BotIsNotAuthorizedToPostInTargetChannel](interaction);
      return;
    }

    if (res.successCtx !== undefined) attemptToDeleteMessage(res.successCtx);

    dbEntry = await insertGreetInDB({ channelId, guildId });
    attemptToSendGreetAddedEphemeral(interaction, channelId);
  } catch (error) {
    if (dbEntry !== null) attemptToDeleteDbEntry(dbEntry);
    if (error instanceof Error) (error as any).maybeChannel = maybeChannel;
    throw error;
  }
}
