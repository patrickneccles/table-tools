/**
 * D&D 5e 2024 Edition Stat Block Types
 */

export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
export type AbilityScores = Record<AbilityKey, number>;

export type DnD5e2024Data = {
  // Basic Info
  name: string;
  size: string;
  type: string;
  alignment: string;

  // Combat Stats
  armorClass: number;
  armorType?: string;
  initiative?: number;
  hitPoints: number;
  hitDice: string;
  speed: string;

  // Ability Scores
  abilityScores: AbilityScores;

  // Proficiencies
  savingThrows?: string[];
  skills?: string[];

  // Resistances & Immunities
  resistances?: string;
  vulnerabilities?: string;
  immunities?: string;
  gear?: string;

  // Senses & Languages
  senses?: string;
  languages?: string;

  // Challenge
  challengeRating: string;
  experiencePoints?: number;
  proficiencyBonus?: number;

  // Features — markdown strings
  traits?: string;
  actions?: string;
  bonusActions?: string;
  reactions?: string;
  legendaryActionsPreamble?: string;
  legendaryActions?: string;

  // Lore
  description?: string;
};

export const ABILITY_KEYS: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function calculateInitiative(dexScore: number): { modifier: number; score: number } {
  const modifier = calculateModifier(dexScore);
  return { modifier, score: 10 + modifier };
}

export function calculateProficiencyBonus(cr: string): number {
  const crNum = cr === '1/8' ? 0.125 : cr === '1/4' ? 0.25 : cr === '1/2' ? 0.5 : parseFloat(cr);
  if (crNum <= 4) return 2;
  if (crNum <= 8) return 3;
  if (crNum <= 12) return 4;
  if (crNum <= 16) return 5;
  if (crNum <= 20) return 6;
  if (crNum <= 24) return 7;
  if (crNum <= 28) return 8;
  return 9;
}
