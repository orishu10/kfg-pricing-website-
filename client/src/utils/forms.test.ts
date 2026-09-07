import { describe, expect, it } from 'vitest';
import { changedFieldCount, initials, PHONE_PATTERN } from './forms';

describe('changedFieldCount', () => {
  it('counts only the fields whose value differs from the initial form', () => {
    const initial = { name: 'Tnuva', city: 'Secaucus', suppliers: ['a', 'b'] };
    expect(changedFieldCount({ ...initial }, initial)).toBe(0);
    expect(changedFieldCount({ ...initial, city: 'Newark' }, initial)).toBe(1);
    expect(changedFieldCount({ name: 'X', city: 'Y', suppliers: ['a'] }, initial)).toBe(3);
  });
});

describe('initials', () => {
  it('takes the first letters of the first and last words', () => {
    expect(initials('Tnuva USA')).toBe('TU');
    expect(initials('osem')).toBe('OS');
    expect(initials('   ', 'C')).toBe('C');
  });
});

describe('PHONE_PATTERN', () => {
  it('accepts digits, spaces, plus, parentheses and dashes only', () => {
    expect(PHONE_PATTERN.test('+1 (201) 555-0100')).toBe(true);
    expect(PHONE_PATTERN.test('')).toBe(true);
    expect(PHONE_PATTERN.test('555 ABC')).toBe(false);
  });
});
