import type { ReadyClient } from '@wpm-discord-bot/shared-types/BotClient';

import { vocabAccessor } from '#𝕃/vocabAccessor';

const readyClientCallback = (readyClient: ReadyClient) =>
  console.log(vocabAccessor().initializers.botIsReady({ botUserTag: readyClient.user.tag, PMID: process.env.pm_id }));

export default readyClientCallback;
