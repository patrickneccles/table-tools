import { describe, expect, it } from 'vitest';
import { spellLevelLabel } from '../types';
import type { SpellLevel } from '../types';

// ---------------------------------------------------------------------------
// spellLevelLabel
// ---------------------------------------------------------------------------

describe('spellLevelLabel', () => {
  it('returns "{school} Cantrip" for cantrip level', () => {
    expect(spellLevelLabel('cantrip', 'Evocation')).toBe('Evocation Cantrip');
  });

  it('works for any school at cantrip level', () => {
    expect(spellLevelLabel('cantrip', 'Necromancy')).toBe('Necromancy Cantrip');
    expect(spellLevelLabel('cantrip', 'Illusion')).toBe('Illusion Cantrip');
  });

  it('returns "1st-Level {school}" for level 1', () => {
    expect(spellLevelLabel('1', 'Abjuration')).toBe('1st-Level Abjuration');
  });

  it('returns "2nd-Level {school}" for level 2', () => {
    expect(spellLevelLabel('2', 'Evocation')).toBe('2nd-Level Evocation');
  });

  it('returns "3rd-Level {school}" for level 3', () => {
    expect(spellLevelLabel('3', 'Conjuration')).toBe('3rd-Level Conjuration');
  });

  it('uses "th" ordinals for levels 4–9', () => {
    const cases: [SpellLevel, string][] = [
      ['4', '4th-Level Enchantment'],
      ['5', '5th-Level Divination'],
      ['6', '6th-Level Transmutation'],
      ['7', '7th-Level Illusion'],
      ['8', '8th-Level Necromancy'],
      ['9', '9th-Level Evocation'],
    ];
    for (const [level, expected] of cases) {
      expect(spellLevelLabel(level, expected.split(' ')[1])).toBe(expected);
    }
  });

  it('includes the school name verbatim in the output', () => {
    expect(spellLevelLabel('1', 'Enchantment')).toContain('Enchantment');
    expect(spellLevelLabel('5', 'Transmutation')).toContain('Transmutation');
  });
});
