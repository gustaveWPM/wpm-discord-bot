import type { MaybeEmptyErrorsDetectionFeedback, EmptyErrorsDetectionFeedback, ErrorsDetectionFeedback } from '@wpm-discord-bot/shared-types/String';
import type { IsPremium } from '@wpm-discord-bot/shared-types/Boolean';
import type { Couple } from '@wpm-discord-bot/shared-types/Utils';
import type { ChatInputCommandInteraction } from 'discord.js';

import { attemptToGetLanguageDmSideOrGuildSide, attemptToGetLanguageGuildSideOrDmSide } from '#𝕃/getLanguagePipelines';
import isPremiumGuild from '#@/premium/isPremiumGuild';
import { vocabAccessor } from '#𝕃/vocabAccessor';

import { EMPTY_FEEDBACK } from '../consts';

async function isPremiumGuard(isPremiumFlag: IsPremium, interaction: ChatInputCommandInteraction): Promise<MaybeEmptyErrorsDetectionFeedback> {
  if (!isPremiumFlag) return EMPTY_FEEDBACK;

  const { guildId, user } = interaction;
  const { id: userId } = user;

  const [unhappyPathFeedback, happyPathFeedback]: Couple<ErrorsDetectionFeedback, EmptyErrorsDetectionFeedback> = [
    vocabAccessor(
      await attemptToGetLanguageGuildSideOrDmSide({
        guildId,
        userId
      })
    ).guardsFeedbacks.premiumOnlyCommand(),

    EMPTY_FEEDBACK
  ];

  // {ToDo} v1.1.0 -> Support DM Premium
  const noDmSupportMsg = vocabAccessor(
    await attemptToGetLanguageDmSideOrGuildSide({
      guildId,
      userId
    })
  ).etc.notImplemented.premiumCommandsAreCurrentlyNotSupportedInDm();

  if (guildId === null) return noDmSupportMsg;

  const _isPremium = await isPremiumGuild(guildId);

  if (_isPremium === null) return noDmSupportMsg;

  const failure = !_isPremium;
  return failure ? unhappyPathFeedback : happyPathFeedback;
}

export default isPremiumGuard;
