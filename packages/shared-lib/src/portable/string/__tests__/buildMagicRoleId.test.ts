import { describe, expect, it } from 'bun:test';

import buildMagicRoleId from '../buildMagicRoleId';

describe('string > buildMagicRoleId', () => {
  it('should return an empty string, given empty string', () => {
    expect(buildMagicRoleId('')).toBe('');
  });

  it('should return a Discord role ID string, given Discord role ID', () => {
    const fakeUserId = String(12345678) as string;
    const computed = buildMagicRoleId(fakeUserId);

    // @ts-expect-error
    expect(computed).toBe(`<@&${fakeUserId}>`);
  });
});
