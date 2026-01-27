/**
 * D&D 5e 2024 Edition Stat Block Types
 * 
 * These are the types from the 2024 D&D Beyond Basic Rules.
 * Key differences from 2014:
 * - Initiative is explicitly shown
 * - Gear field for retrievable equipment
 * - Proficiency Bonus shown in CR line
 * - Resistances and Immunities are separate
 */

/** The six D&D ability score keys */
export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

/** Ability scores mapped by key */
export type AbilityScores = Record<AbilityKey, number>;

/** A trait/action entry with name and description */
export type TraitEntry = {
  name: string;
  description: string;
};

/** Keys for sections that contain trait entries */
export type TraitSectionKey = "traits" | "actions" | "bonusActions" | "reactions" | "legendaryActions";

/**
 * D&D 5e 2024 Stat Block Data Structure
 */
export type DnD5e2024Data = {
  // Basic Info
  name: string;
  size: string;
  type: string;
  alignment: string;
  
  // Combat Stats
  armorClass: number;
  armorType?: string;
  initiative?: number; // NEW in 2024: explicit initiative
  hitPoints: number;
  hitDice: string;
  speed: string;
  
  // Ability Scores
  abilities: AbilityScores;
  
  // Proficiencies
  savingThrows?: string[];
  skills?: string[];
  
  // Resistances & Immunities (more granular in 2024)
  resistances?: string; // Damage types
  vulnerabilities?: string; // Damage types
  immunities?: string; // Damage types AND conditions combined
  
  // Gear (NEW in 2024)
  gear?: string[];
  
  // Senses & Languages
  senses?: string;
  languages?: string;
  
  // Challenge
  challengeRating: string;
  experiencePoints?: number;
  proficiencyBonus?: number; // NEW in 2024: explicit PB
  
  // Traits & Abilities
  traits?: TraitEntry[];
  actions?: TraitEntry[];
  bonusActions?: TraitEntry[];
  reactions?: TraitEntry[];
  legendaryActions?: TraitEntry[];
  
  // Lore
  description?: string;
};

/** Ordered list of ability keys for consistent rendering */
export const ABILITY_KEYS: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

/** All trait section keys for iteration */
export const TRAIT_SECTION_KEYS: TraitSectionKey[] = [
  "traits",
  "actions",
  "bonusActions",
  "reactions",
  "legendaryActions",
];

/** Display names for trait sections */
export const TRAIT_SECTION_LABELS: Record<TraitSectionKey, string> = {
  traits: "Traits",
  actions: "Actions",
  bonusActions: "Bonus Actions",
  reactions: "Reactions",
  legendaryActions: "Legendary Actions",
};

/** Calculate ability modifier from score */
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/** Format modifier with +/- sign */
export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/** Calculate Initiative from Dexterity */
export function calculateInitiative(dexScore: number, proficiencyBonus: number = 0): { modifier: number; score: number } {
  const modifier = calculateModifier(dexScore);
  return {
    modifier,
    score: 10 + modifier
  };
}

/** Calculate Proficiency Bonus from CR */
export function calculateProficiencyBonus(cr: string): number {
  const crNum = cr === "1/8" ? 0.125 : cr === "1/4" ? 0.25 : cr === "1/2" ? 0.5 : parseFloat(cr);
  
  if (crNum <= 4) return 2;
  if (crNum <= 8) return 3;
  if (crNum <= 12) return 4;
  if (crNum <= 16) return 5;
  if (crNum <= 20) return 6;
  if (crNum <= 24) return 7;
  if (crNum <= 28) return 8;
  return 9;
}
