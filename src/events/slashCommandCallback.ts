import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { ExtendedClient } from '@wpm-discord-bot/shared-types/BotClient';
import type { NotNull } from '@wpm-discord-bot/shared-types/Utils';
import type { GuildMember, Interaction } from 'discord.js';

import attemptToMoveTempBannedMembersMissingPermsToTempBannedMembers from '#@/jobs/helpers/tempBans/db/attemptToMoveTempBannedMembersMissingPermsToTempBannedMembers';
import attemptToDeleteInteractionReply from '@wpm-discord-bot/shared-lib/discordjs/attemptToDeleteInteractionReply';
import attemptToReplyToInteraction from '@wpm-discord-bot/shared-lib/discordjs/attemptToReplyToInteraction';
import attemptToDeleteTimeoutOnBot from '#@/jobs/helpers/timeoutOnBot/db/attemptToDeleteTimeoutOnBot';
import attemptToUpsertTimeoutOnBot from '#@/jobs/helpers/timeoutOnBot/db/attemptToUpsertTimeoutOnBot';
import lazilyFetchGuildMember from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchGuildMember';
import { INTERACTION_HAS_ALREADY_BEEN_ACKNOWLEDGED } from '@wpm-discord-bot/shared-specs/Discord';
import isGuildInteraction from '@wpm-discord-bot/shared-lib/discordjs/isGuildInteraction';
import attemptToSendDM from '@wpm-discord-bot/shared-lib/discordjs/attemptToSendDM';
import { attemptToGetLanguageDmSideOrGuildSide } from '#𝕃/getLanguagePipelines';
import botIsTimedOut from '@wpm-discord-bot/shared-lib/discordjs/botIsTimedout';
import traceError from '#@/helpers/interactions/traceError';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import { DiscordAPIError } from 'discord.js';

async function manageBotIsTimedOutThenReturn(botMember: GuildMember, interaction: GuildInteraction): Promise<boolean> {
  const { guildId, guild, user } = interaction;
  const { id: userId } = user;

  if (!botIsTimedOut(botMember)) {
    attemptToDeleteTimeoutOnBot(guildId);

    if (botMember.permissions.has('BanMembers')) {
      attemptToMoveTempBannedMembersMissingPermsToTempBannedMembers(guild);
    }

    return false;
  }

  interaction.reply({
    content: vocabAccessor(await attemptToGetLanguageDmSideOrGuildSide({ guildId, userId })).errors.guildSlashCommand.botIsCurrentlyTimedOut(),

    ephemeral: true
  });

  attemptToUpsertTimeoutOnBot(guildId, botMember.communicationDisabledUntil as NotNull<typeof botMember.communicationDisabledUntil>);
  return true;
}

async function slashCommandCallback(interaction: Interaction) {
  const rejectedByDuckTyping = !interaction.isChatInputCommand();
  if (rejectedByDuckTyping) return;

  const { commandName, guildId, client, user } = interaction;
  const { id: userId, username } = user;

  try {
    const command = (client as ExtendedClient).commands.get(commandName);
    if (command === undefined) return;

    if (isGuildInteraction(interaction)) {
      const { guild } = interaction;

      const discordBotId = client.user.id;
      const botMember = await lazilyFetchGuildMember(guild, discordBotId);

      if (botMember !== null && (await manageBotIsTimedOutThenReturn(botMember, interaction))) return;
    }

    await command.execute(interaction);
  } catch (error) {
    traceError(error, {
      ctx: {
        users: {
          caller: {
            username,
            userId
          }
        },

        commandName
      },

      from: slashCommandCallback.name
    });

    if (error instanceof DiscordAPIError && (error as any).code === INTERACTION_HAS_ALREADY_BEEN_ACKNOWLEDGED) {
      return;
    }

    const errorMsg = vocabAccessor(await attemptToGetLanguageDmSideOrGuildSide({ guildId, userId })).vocab.failedToInteract();

    if (interaction.deferred && !interaction.ephemeral) {
      // eslint-disable-next-line promise/catch-or-return
      Promise.all([attemptToSendDM(user, { content: errorMsg }), attemptToDeleteInteractionReply(interaction)]);
    } else {
      attemptToReplyToInteraction(interaction, { content: errorMsg, ephemeral: true });
    }
  }
}

export default slashCommandCallback;
