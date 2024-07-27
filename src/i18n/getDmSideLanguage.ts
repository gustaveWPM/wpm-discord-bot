import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';
import type { User } from 'discord.js';

import type { Locales } from './typesafe-i18n/i18n-types';

// {ToDo} v1.1.0 -> Implement this stub
// Also take an optional interaction locale as second param, since interaction has a .locale attribute which we could use to infer the language and push it in the DB
// eslint-disable-next-line require-await
async function getDmSideLanguage(userId: MaybeNull<User['id']>): Promise<MaybeNull<Locales>> {
  if (userId === null) return null;
  return null;
}

export default getDmSideLanguage;
