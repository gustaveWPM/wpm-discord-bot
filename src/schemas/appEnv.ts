import { minLength, string, object, regex, pipe } from 'valibot';

import { isUnsignedNumberRegex } from './utils/regexs';

const POSITIVE_NUMBER_CONSTRAINT_MSG = 'must be a positive number' as const;
const NOT_EMPTY_STRING_CONSTRAINT_MSG = 'must be a not empty string' as const;

// NOTE: https://github.com/discord/discord-api-docs/issues/2495
/* eslint-disable perfectionist/sort-objects */

const schemaObj = {
  BOT_TOKEN: pipe(string(), minLength(1, `Invalid BOT_TOKEN: ${NOT_EMPTY_STRING_CONSTRAINT_MSG}`)),
  CLIENT_ID: pipe(string(), regex(isUnsignedNumberRegex, `Invalid CLIENT_ID: ${POSITIVE_NUMBER_CONSTRAINT_MSG}`)),
  DEV_GUILD_ID: pipe(string(), regex(isUnsignedNumberRegex, `Invalid DEV_GUILD_ID: ${POSITIVE_NUMBER_CONSTRAINT_MSG}`)),
  BOT_APP_REDIS_PORT: pipe(string(), regex(isUnsignedNumberRegex, `Invalid BOT_APP_REDIS_PORT: ${POSITIVE_NUMBER_CONSTRAINT_MSG}`))
} as const;

/* eslint-enable perfectionist/sort-objects */

const appEnvSchema = object(schemaObj);

export default appEnvSchema;

export type AppEnv = (typeof appEnvSchema)['_types'] extends undefined ? never : Required<typeof appEnvSchema>['_types']['output'];
