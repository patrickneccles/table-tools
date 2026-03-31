/**
 * D&D 5e 2014 Edition Stat Block Types
 * 
 * These are the types from the original 2014 Monster Manual and SRD.
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
 * D&D 5e 2014 Stat Block Data Structure
 */
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
  
  // Features
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
