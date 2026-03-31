/**
 * Shadowdark RPG Stat Block Types
 * 
 * Shadowdark uses a streamlined, compact format with abbreviated stats.
 */

/** Ability score modifiers (Shadowdark displays modifiers, not raw scores) */
export type ShadowdarkAbilityScores = {
  str: number;  // Strength modifier
  dex: number;  // Dexterity modifier
  con: number;  // Constitution modifier
  int: number;  // Intelligence modifier
  wis: number;  // Wisdom modifier
  cha: number;  // Charisma modifier
};

/** An ability or special feature */
export type ShadowdarkFeature = {
  name: string;
  description: string;
};

/**
 * Shadowdark Stat Block Data Structure
 */
export type ShadowdarkData = {
  // Basic Info
  name: string;
  description: string;  // Short italic description

  // Core Stats (all in one dense line)
  armorClass: number;
  hitPoints: number;
  attack: string;  // e.g., "2 tentacle (near) +5 (1d8 + curse) or 1 tail +5 (3d6)"
  movement: string;  // e.g., "near (swim)"

  // Ability Modifiers (displayed as +/- values)
  abilityScores: ShadowdarkAbilityScores;

  // Meta
  alignment: string;  // e.g., "C" for Chaotic
  level: number;  // Monster level

  // Features
  features?: ShadowdarkFeature[];
};

/** Ordered list of ability keys for consistent rendering */
export const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"] as const;

/** Ability labels (uppercase) */
export const ABILITY_LABELS: Record<keyof ShadowdarkAbilityScores, string> = {
  str: "S",
  dex: "D",
  con: "C",
  int: "I",
  wis: "W",
  cha: "Ch",
};

/** Format modifier with +/- sign */
export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
