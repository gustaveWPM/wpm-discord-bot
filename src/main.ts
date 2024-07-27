import { startTimeoutOnBotHandler } from './jobs/handleToOnBot';
import { startTempBansHandler } from './jobs/handleTempBans';
import traceError from './helpers/interactions/traceError';
import { validateDbEnv } from './helpers/ini/env';
import { login } from './client';

validateDbEnv();

function startJobs() {
  startTempBansHandler();
  startTimeoutOnBotHandler();
}

async function botEntryPoint() {
  try {
    await login({ log: true });
    startJobs();
  } catch (error) {
    traceError(error, { from: 'botEntryPoint' });
    throw error;
  }
}

botEntryPoint();
