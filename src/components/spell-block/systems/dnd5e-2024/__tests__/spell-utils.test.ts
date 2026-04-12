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
    expect(spellLevelLabel('1', 'Abjuration')).toBe('Level 1 Abjuration');
  });

  it('returns "2nd-Level {school}" for level 2', () => {
    expect(spellLevelLabel('2', 'Evocation')).toBe('Level 2 Evocation');
  });

  it('returns "3rd-Level {school}" for level 3', () => {
    expect(spellLevelLabel('3', 'Conjuration')).toBe('Level 3 Conjuration');
  });

  it('uses "th" ordinals for levels 4–9', () => {
    const cases: [SpellLevel, string][] = [
      ['4', 'Level 4 Enchantment'],
      ['5', 'Level 5 Divination'],
      ['6', 'Level 6 Transmutation'],
      ['7', 'Level 7 Illusion'],
      ['8', 'Level 8 Necromancy'],
      ['9', 'Level 9 Evocation'],
    ];
    for (const [level, expected] of cases) {
      expect(spellLevelLabel(level, expected.split(' ')[2])).toBe(expected);
    }
  });

  it('includes the school name verbatim in the output', () => {
    expect(spellLevelLabel('1', 'Enchantment')).toContain('Enchantment');
    expect(spellLevelLabel('5', 'Transmutation')).toContain('Transmutation');
  });
});
