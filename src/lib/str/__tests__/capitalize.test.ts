import { describe, expect, it } from 'bun:test';

import capitalize from '../capitalize';

describe('string > capitalize', () => {
  it('should return capitalized string, given any string', () => {
    expect(capitalize('abc')).toBe('Abc');
    expect(capitalize('aBc')).toBe('ABc');
    expect(capitalize('ABC')).toBe('ABC');
    expect(capitalize(' aBC')).toBe(' aBC');
  });

  it("should return '', given an empty string", () => {
    expect(capitalize('')).toBe('');
  });
});
