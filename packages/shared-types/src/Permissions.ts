import type { DANGEROUS_PERMISSIONS } from '@wpm-discord-bot/shared-specs/Discord';

import type { Index } from './Number';

export type DangerousPermission = (typeof DANGEROUS_PERMISSIONS)[Index];
