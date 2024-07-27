import { describe, expect, it } from 'bun:test';

import shorten from '../shorten';

describe('string > shorten', () => {
  it('should return the same string, given the string length is not exceeding the limit', () => {
    const s = 'abc';

    expect(shorten(s, s.length)).toBe(s);
    expect(shorten(s, s.length + 1)).toBe(s);
  });

  it('should return a shortened string, given the string length is exceeding the limit', () => {
    const s = 'abcd';

    expect(shorten(s, 3)).toBe('ab…');
    expect(shorten(s, 2)).toBe('a…');
    expect(shorten(s, 1)).toBe('…');
    expect(shorten(s, 0)).toBe('');
    expect(shorten(s, -1)).toBe('');
  });
});
