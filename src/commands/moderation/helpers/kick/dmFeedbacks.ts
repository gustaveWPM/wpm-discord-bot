import type { FailedToInteractModerationCommandEphemeralFn } from '@wpm-discord-bot/shared-types/Interaction';

import attemptToReplyToInteraction from '@wpm-discord-bot/shared-lib/discordjs/attemptToReplyToInteraction';
import buildMagicUserId from '@wpm-discord-bot/shared-lib/portable/string/buildMagicUserId';
import { attemptToGetLanguageDmSideOrGuildSide } from '#𝕃/getLanguagePipelines';
import { vocabAccessor } from '#𝕃/vocabAccessor';

export const attemptToSendKickFailedToInteractEphemeral: FailedToInteractModerationCommandEphemeralFn = async ({
  targetMemberId,
  interaction,
  guildName
}) =>
  attemptToReplyToInteraction(interaction, {
    content: vocabAccessor(
      await attemptToGetLanguageDmSideOrGuildSide({ guildId: interaction.guildId, userId: interaction.user.id })
    ).errors.kickCallback.followUpFeedback.failedToInteract({
      memberIdMagicString: buildMagicUserId(targetMemberId),
      guildName
    }),

    ephemeral: true
  });
