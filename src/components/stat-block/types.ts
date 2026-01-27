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
export type TraitSectionKey = "traits" | "actions" | "bonusActions" | "reactions" | "legendaryActions" | "features";

/** Display names for trait sections */
export const TRAIT_SECTION_LABELS: Record<TraitSectionKey, string> = {
  traits: "Traits",
  actions: "Actions",
  bonusActions: "Bonus Actions",
  reactions: "Reactions",
  legendaryActions: "Legendary Actions",
  features: "Features",
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


export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
