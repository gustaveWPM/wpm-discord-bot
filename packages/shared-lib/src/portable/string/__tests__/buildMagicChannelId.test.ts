import { describe, expect, it } from 'bun:test';

import buildMagicChannelId from '../buildMagicChannelId';

describe('string > buildMagicChannelId', () => {
  it('should return an empty string, given empty string', () => {
    expect(buildMagicChannelId('')).toBe('');
  });

  it('should return a Channel ID string, given Channel ID', () => {
    const fakeChannelId = String(12345678) as string;
    const computed = buildMagicChannelId(fakeChannelId);

    // @ts-expect-error
    expect(computed).toBe(`<#${fakeChannelId}>`);
  });
});
