import { loadAllLocales } from '#𝕃/typesafe-i18n/i18n-util.sync';
import { buildInitializedClient } from '#@/helpers/ini/client';
import { beforeAll, describe, expect, it } from 'bun:test';
import { Collection, Partials } from 'discord.js';

describe('Bot initialization', () => {
  beforeAll(() => {
    loadAllLocales();
  });

  it('should build an initialized client properly', () => {
    const fakeMountedClient = buildInitializedClient([Partials.GuildMember, Partials.GuildScheduledEvent, Partials.ThreadMember], 3276799, {
      commands: new Collection()
    });

    /*
        "userAgentAppendix": "discord.js/14.x.x Bun/1.1.x",

        Keeping the userAgentAppendix in this snapshot testing is pointless, and can even lead to false positives.
        As soon as Bun or Discord.js will be updated (for example: `Bun/1.1.10` would become `Bun/1.1.12`), the CI will break because of this line. Let's remove it.
    */
    delete fakeMountedClient.options.rest?.userAgentAppendix;
    // @ts-expect-error - IDGAF, lemme manipulate the RAM
    delete fakeMountedClient.rest?.options.userAgentAppendix;

    // * ... Those values are not stable, and can change between each test run. Let's remove them.

    // @ts-expect-error - IDGAF, lemme manipulate the RAM
    delete fakeMountedClient.rest.hashTimer;
    // @ts-expect-error - IDGAF, lemme manipulate the RAM
    delete fakeMountedClient.rest.handlerTimer;
    // @ts-expect-error - IDGAF, lemme manipulate the RAM
    delete fakeMountedClient.sweepers.intervals.threads;

    expect(fakeMountedClient).toMatchSnapshot();
    expect(JSON.stringify(fakeMountedClient, null, 2)).toMatchSnapshot();
  });
});
