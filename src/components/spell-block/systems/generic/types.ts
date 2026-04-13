export type SpellLevel = 'cantrip' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export type GenericSpellData = {
  name: string;
  level: SpellLevel;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  classes: string;
  description: string;
  source: string;
};

// ─── Select options ────────────────────────────────────────────────────────

export const SPELL_LEVEL_OPTIONS = [
  { value: 'cantrip', label: 'Cantrip' },
  { value: '1', label: '1st Level' },
  { value: '2', label: '2nd Level' },
  { value: '3', label: '3rd Level' },
  { value: '4', label: '4th Level' },
  { value: '5', label: '5th Level' },
  { value: '6', label: '6th Level' },
  { value: '7', label: '7th Level' },
  { value: '8', label: '8th Level' },
  { value: '9', label: '9th Level' },
] as const;

export const SPELL_SCHOOL_OPTIONS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
].map((s) => ({ value: s, label: s }));

// ─── Utilities ─────────────────────────────────────────────────────────────

const ORDINALS = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'] as const;

export function spellLevelLabel(level: SpellLevel, school: string): string {
  if (level === 'cantrip') return `${school} Cantrip`;
  return `${ORDINALS[Number(level)]}-Level ${school}`;
}
