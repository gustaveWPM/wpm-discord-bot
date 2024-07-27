import type { GuildMember } from 'discord.js';

import toUTC from '@wpm-discord-bot/shared-lib/portable/date/toUTC';
import { User } from 'discord.js';

function isAlreadyMuted(user: GuildMember | User) {
  const muteTimestamp = user instanceof User ? 0 : (user.communicationDisabledUntilTimestamp ?? 0);
  const currentUtcTimestamp = toUTC(new Date()).getTime();
  const isAlreadyMuted = muteTimestamp > currentUtcTimestamp;

  return isAlreadyMuted;
}

export default isAlreadyMuted;
