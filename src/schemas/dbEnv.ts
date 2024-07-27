import { minLength, string, object, pipe } from 'valibot';

const NOT_EMPTY_STRING_CONSTRAINT_MSG = 'must be a not empty string' as const;

/* eslint-disable perfectionist/sort-objects */

const schemaObj = {
  BOT_APP_DATABASE_URL: pipe(string(), minLength(1, `Invalid BOT_APP_DATABASE_URL: ${NOT_EMPTY_STRING_CONSTRAINT_MSG}`))
} as const;

/* eslint-enable perfectionist/sort-objects */

const dbEnvSchema = object(schemaObj);

export default dbEnvSchema;
