import { describe, expect, it } from 'bun:test';

import surround from '../surround';

describe('string > surround', () => {
  it('should return envelope + foo + envelope', () => {
    const foo = 'foo';
    const envelope = 'bar';
    const expected = envelope + foo + envelope;

    expect(surround(foo, envelope)).toBe(expected);
    expect(surround(envelope + foo, envelope)).toBe(expected);
    expect(surround(foo + envelope, envelope)).toBe(expected);
    expect(surround(expected, envelope)).toBe(expected);
  });

  it("should return 'barbar', given '' as input and 'bar' as envelope", () => {
    const envelope = 'bar';
    expect(surround('', envelope)).toBe(envelope.repeat(2));
  });
});
