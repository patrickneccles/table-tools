/**
 * D&D 5e 2014 Edition Stat Block Types
 */

export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
export type AbilityScores = Record<AbilityKey, number>;

export type DnD5e2014Data = {
  // Basic Info
  name: string;
  size: string;
  type: string;
  alignment: string;

  // Combat Stats
  armorClass: number;
  armorType?: string;
  hitPoints: number;
  hitDice: string;
  speed: string;

  // Ability Scores
  abilityScores: AbilityScores;

  // Proficiencies
  savingThrows?: string[];
  skills?: string[];

  // Resistances & Immunities
  damageResistances?: string;
  damageImmunities?: string;
  damageVulnerabilities?: string;
  conditionImmunities?: string;

  // Senses & Languages
  senses?: string;
  languages?: string;

  // Challenge
  challengeRating: string;
  experiencePoints?: number;

  // Features — markdown strings
  traits?: string;
  actions?: string;
  bonusActions?: string;
  reactions?: string;
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
