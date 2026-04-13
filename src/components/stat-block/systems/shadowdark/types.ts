/**
 * Shadowdark RPG Stat Block Types
 */

export type ShadowdarkAbilityScores = {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
};

export type ShadowdarkData = {
  name: string;
  description: string;
  armorClass: number;
  hitPoints: number;
  attack: string;
  movement: string;
  abilityScores: ShadowdarkAbilityScores;
  alignment: string;
  level: number;
  // Features — markdown string
  features?: string;
};

export const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

export const ABILITY_LABELS: Record<keyof ShadowdarkAbilityScores, string> = {
  str: 'S',
  dex: 'D',
  con: 'C',
  int: 'I',
  wis: 'W',
  cha: 'Ch',
};

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
