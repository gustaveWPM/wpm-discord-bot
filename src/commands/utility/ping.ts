import type {
  ConstructedSlashCommandWithChoicesPairsOrderedChoicesValuesRecord,
  SlashCommandWithChoicesPairsOrderedChoicesValuesRecordConstructor,
  SlashCommandI18nDictIdentifier
} from '@wpm-discord-bot/shared-types/BotI18n';
import type { SlashCommandRequiredOptionsConfig, DefaultMemberPermissions } from '@wpm-discord-bot/shared-types/SlashCommand';
import type { ChatInputCommandInteraction } from 'discord.js';

import createI18nSlashCommandOptionChoices from '#@/helpers/interactions/builders/functions/createI18nSlashCommandOptionChoices';
import createI18nSlashCommandOption from '#@/helpers/interactions/builders/functions/createI18nSlashCommandOption';
import attemptToReplyToInteraction from '@wpm-discord-bot/shared-lib/discordjs/attemptToReplyToInteraction';
import createI18nSlashCommand from '#@/helpers/interactions/builders/functions/createI18nSlashCommand';
import { attemptToGetLanguageDmSideOrGuildSide } from '#𝕃/getLanguagePipelines';
import traceError from '#@/helpers/interactions/traceError';
import { ApplicationCommandOptionType } from 'discord.js';
import { vocabAccessor } from '#𝕃/vocabAccessor';

const id = 'ping' as const satisfies SlashCommandI18nDictIdentifier;

export const pingRequiredOptionsConfig = {
  'meaningless-choice': false
} as const satisfies SlashCommandRequiredOptionsConfig<typeof id>;

const orderedUselessChoices = {
  /* eslint-disable perfectionist/sort-objects */
  lmao: 'useless',
  lol: 'useless-too'
  /* eslint-enable perfectionist/sort-objects */
} as const satisfies SlashCommandWithChoicesPairsOrderedChoicesValuesRecordConstructor<
  typeof id,
  'meaningless-choice'
> satisfies ConstructedSlashCommandWithChoicesPairsOrderedChoicesValuesRecord;

const commandOptions = [
  createI18nSlashCommandOption({ optionKey: 'meaningless-choice', id }, { type: ApplicationCommandOptionType.String })
    .setRequired(pingRequiredOptionsConfig['meaningless-choice'])
    .addChoices(...createI18nSlashCommandOptionChoices({ commandOption: 'meaningless-choice', commandId: id }, orderedUselessChoices))
];

const pingCommand = createI18nSlashCommand(
  id,
  async (interaction: ChatInputCommandInteraction) => {
    const { commandName, guildId, client, user } = interaction;
    const { id: userId } = user;

    try {
      await attemptToReplyToInteraction(interaction, { content: client.ws.ping + 'ms' });
    } catch (error) {
      traceError(error, { commandName });
      await attemptToReplyToInteraction(interaction, {
        content: vocabAccessor(await attemptToGetLanguageDmSideOrGuildSide({ guildId, userId })).vocab.failedToInteract(),

        ephemeral: true
      });
    }
  },

  {
    permissions: {
      defaultMemberPermissionsUsingANDGate: new Set(['Administrator'] as const satisfies DefaultMemberPermissions[]),
      isUsableInDM: true,
      isPremium: false
    },

    commandOptions
  }
);

export default pingCommand;
