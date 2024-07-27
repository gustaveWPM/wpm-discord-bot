import type { ChatInputCommandInteraction } from 'discord.js';

import attemptToReplyToInteraction from '@wpm-discord-bot/shared-lib/discordjs/attemptToReplyToInteraction';
import { attemptToGetLanguageGuildSideOrDmSide } from '#𝕃/getLanguagePipelines';
import { vocabAccessor } from '#𝕃/vocabAccessor';

const failedToInteract = async (justChatInteraction: ChatInputCommandInteraction) =>
  attemptToReplyToInteraction(justChatInteraction, {
    content: vocabAccessor(
      await attemptToGetLanguageGuildSideOrDmSide({
        guildId: justChatInteraction.guildId,
        userId: justChatInteraction.user.id
      })
    ).vocab.failedToInteract(),

    ephemeral: true
  });

export default failedToInteract;
