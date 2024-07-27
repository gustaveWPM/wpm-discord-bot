import type { IsPremium } from '@wpm-discord-bot/shared-types/Boolean';
import type { Count } from '@wpm-discord-bot/shared-types/Number';

import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';

import { EGreetMisusages } from '../enums';

function isAuthorizedToCreateNewGreetWithCurrentPlan(isPremium: IsPremium, count: Count): EGreetMisusages {
  const { MAX_GREETS_PER_GUILD_WITH_FREEMIUM, MAX_GREETS_PER_GUILD_WITH_PREMIUM } =
    BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.MEMBERS_ONBOARDING.GREET;

  const isFreemium = !isPremium;

  if (isFreemium && count >= MAX_GREETS_PER_GUILD_WITH_FREEMIUM) {
    return EGreetMisusages.ReachedMaxGreetsAmountInFreemium;
  }

  if (isPremium && count >= MAX_GREETS_PER_GUILD_WITH_PREMIUM) {
    return EGreetMisusages.ReachedMaxGreetsAmountInPremium;
  }

  return EGreetMisusages.OK;
}

export default isAuthorizedToCreateNewGreetWithCurrentPlan;
