import type { TimestampInMs, MsValue, Count, Limit } from '@wpm-discord-bot/shared-types/Number';
import type { StringifiedReport, Filepath } from '@wpm-discord-bot/shared-types/String';
import type { Couple } from '@wpm-discord-bot/shared-types/Utils';
import type { JsonObj } from '@wpm-discord-bot/shared-types/JSON';

import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import toUTC from '@wpm-discord-bot/shared-lib/portable/date/toUTC';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const ADDITIONAL_INFOS_NAMESPACE = 'additionalInfo' as const satisfies PropertyKey;
const [RESERVED_DEEP_TRACE_KEY, RESERVED_FLAT_TRACE_KEY] = ['__DEEP_TRACE__', '__FLAT_TRACE__'] as const satisfies Couple<PropertyKey>;

const ERROR_PROPS_TO_PRESERVE = ['message', 'name', 'stack', 'cause', 'code', ADDITIONAL_INFOS_NAMESPACE] as const;

const COUNTER_TTL: MsValue = 1_200_000; // NOTE: 20 mins
const COUNTER_THRESHOLD: Limit = 200;

namespace Ctx {
  export let hasReachedThreshold = false;
  export let counter: Count = 0;
  export let ttlTimestamp: TimestampInMs = new Date().getTime();
}

async function attemptToWriteLogFile(filepath: Filepath, report: StringifiedReport) {
  try {
    await Bun.write(filepath, report);
    console.error('Traced an error in the file:', filepath);
  } catch {
    console.error('Failed to write error trace file:', filepath);
    console.error(report);
  }
}

function generateReport(trace: unknown, report: object) {
  /**
   * @throws {TypeError}
   */
  function tryToStringifyReport(): StringifiedReport {
    if (trace instanceof Error) {
      return JSON.stringify(report, [...ERROR_PROPS_TO_PRESERVE]);
    } else {
      return JSON.stringify(report);
    }
  }

  const date = toUTC(new Date());

  const formattedDate = date.toLocaleDateString('en-US', {
    month: '2-digit',
    year: 'numeric',
    day: '2-digit'
  });

  const sep = '-';

  const shortDate = formattedDate.replace(/\//g, sep);

  const filename = [shortDate, date.getTime(), uuidv4()].join(sep) + '.error.trace';
  const filepath = path.join(__dirname, '../../..', BOT_APP_HARD_CODED_STATIC_CONTEXT.SYS.ARBORESCENCE.TRACES_FOLDER, filename);

  try {
    const stringifiedReport = tryToStringifyReport();
    attemptToWriteLogFile(filepath, stringifiedReport);
  } catch (error) {
    console.error('Failed to stringify report!');
    console.error(error);
    console.error('Report:');
    console.error(report);
  }
}

function traceError(trace: unknown, additionalInfo?: JsonObj) {
  const shoudResetTracesCounter = new Date().getTime() > Ctx.ttlTimestamp;

  if (shoudResetTracesCounter) {
    Ctx.hasReachedThreshold = false;
    Ctx.counter = 1;
    Ctx.ttlTimestamp = new Date().getTime() + COUNTER_TTL;
  } else {
    if (Ctx.counter >= COUNTER_THRESHOLD) {
      if (!Ctx.hasReachedThreshold) {
        console.error('ATTENTION: Traces counter has reached the stress threshold!');
        Ctx.hasReachedThreshold = true;
      }

      return;
    }

    Ctx.counter += 1;
  }

  const { message, cause, stack, name, code, ...restPtr } = trace as any;

  const report = {
    [ADDITIONAL_INFOS_NAMESPACE]: additionalInfo ? JSON.stringify(additionalInfo, null, 2) : undefined,
    ...(typeof trace === 'object'
      ? { [RESERVED_DEEP_TRACE_KEY]: structuredClone(restPtr), message, cause, stack, name, code }
      : { [RESERVED_FLAT_TRACE_KEY]: trace })
  } as const;

  generateReport(trace, report);
}

export default traceError;
