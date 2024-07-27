import type { Limit } from '@wpm-discord-bot/shared-types/Number';

export const MAX_UNBANS_PER_MINUTE_AND_PER_GUILD = 10 as const satisfies Limit;
export const JOBS_MAX_GLOBAL_REQ_PER_SECOND = 20 as const satisfies Limit;
