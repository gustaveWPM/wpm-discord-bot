import appEnvSchema from '#@/schemas/appEnv';
import dbEnvSchema from '#@/schemas/dbEnv';
import { parse } from 'valibot';

/**
 * @throws {Error}
 */
export function buildAppEnv(options: Options = {}) {
  const valibotOutput = parse(appEnvSchema, process.env);

  if (options.log) {
    console.log('buildAppEnv' + ' -> ' + 'valibot.parse() output:');
    console.log(valibotOutput);
  }

  return valibotOutput;
}

/**
 * @throws {Error}
 */
export function validateDbEnv(options: Options = {}) {
  const valibotOutput = parse(dbEnvSchema, process.env);

  if (options.log) {
    console.log('validateDbEnv' + ' -> ' + 'valibot.parse() output:');
    console.log(valibotOutput);
  }
}

type Options = Partial<{ log: boolean }>;
