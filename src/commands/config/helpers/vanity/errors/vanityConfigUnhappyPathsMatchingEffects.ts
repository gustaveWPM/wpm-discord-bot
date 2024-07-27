import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';

import { failedToInteract } from '#@/commands/config/configCallback';

import {
  attemptToSendBotNotAuthorizedToGiveThisRoleEphemeral,
  attemptToSendTargetedRoleIsEveryoneEphemeral,
  attemptToSendYouCantGiveThisRoleEphemeral
} from '../feedbacks';
import { EVanityConfigMisusages } from '../enums';

export const vanityConfigUnhappyPathsMatchingEffects = {
  [EVanityConfigMisusages.BotNotAuthorizedToGiveThisRole]: (i) => {
    attemptToSendBotNotAuthorizedToGiveThisRoleEphemeral(i);
  },

  [EVanityConfigMisusages.MemberNotAuthorizedToGiveThisRole]: (i) => {
    attemptToSendYouCantGiveThisRoleEphemeral(i);
  },

  [EVanityConfigMisusages.IsEveryoneRole]: (i) => {
    attemptToSendTargetedRoleIsEveryoneEphemeral(i);
  },

  [EVanityConfigMisusages.UnknownError]: (i) => {
    failedToInteract(i);
  }
} as const satisfies Record<Exclude<EVanityConfigMisusages, EVanityConfigMisusages.OK>, (interaction: GuildInteraction) => void>;
