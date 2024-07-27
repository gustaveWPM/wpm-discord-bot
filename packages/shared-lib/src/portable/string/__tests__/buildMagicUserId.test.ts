import { describe, expect, it } from 'bun:test';

import buildMagicUserId from '../buildMagicUserId';

describe('string > buildMagicUserId', () => {
  it('should return an empty string, given empty string', () => {
    expect(buildMagicUserId('')).toBe('');
  });

  it('should return an empty string, given -1', () => {
    const fakeUserId = String(-1);
    expect(buildMagicUserId(fakeUserId)).toBe('');
  });

  it('should return a Discord user ID string, given Discord user ID', () => {
    const fakeUserId = String(12345678) as string;
    const computed = buildMagicUserId(fakeUserId);

    // @ts-expect-error
    expect(computed).toBe(`<@${fakeUserId}>`);
  });
});
