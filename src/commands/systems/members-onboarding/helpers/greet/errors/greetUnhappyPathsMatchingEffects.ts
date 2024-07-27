import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { NotNull } from '@wpm-discord-bot/shared-types/Utils';

import {
  attemptToSendUsedAllYourGreetCreditsWithFreemiumPlanEphemeral,
  attemptToSendUsedAllYourGreetCreditsWithPremiumPlanEphemeral,
  attemptToSendBotIsMissingPermissionsEphemeral
} from '../feedback/addFeatureFeedbacks';
import getMaybeTargetChannel from '../toggle/getMaybeTargetChannel';
import { EGreetMisusages } from '../enums';

export const greetUnhappyPathsMatchingEffects = {
  [EGreetMisusages.BotIsNotAuthorizedToPostInTargetChannel]: (i) => {
    const targetChannel = getMaybeTargetChannel(i) as NotNull<ReturnType<typeof getMaybeTargetChannel>>;
    attemptToSendBotIsMissingPermissionsEphemeral(i, targetChannel.id);
  },

  [EGreetMisusages.ReachedMaxGreetsAmountInFreemium]: (i) => {
    attemptToSendUsedAllYourGreetCreditsWithFreemiumPlanEphemeral(i);
  },

  [EGreetMisusages.ReachedMaxGreetsAmountInPremium]: (i) => {
    attemptToSendUsedAllYourGreetCreditsWithPremiumPlanEphemeral(i);
  }
} as const satisfies Record<Exclude<EGreetMisusages, EGreetMisusages.OK>, (interaction: GuildInteraction) => void>;
