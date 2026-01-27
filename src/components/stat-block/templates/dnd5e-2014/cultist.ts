import type { DnD5e2014Data } from "../../systems/dnd5e-2014/types";

export const cultistTemplate: DnD5e2014Data = {
  name: "Cultist",
  size: "Medium",
  type: "humanoid (any race)",
  alignment: "any non-good",
  armorClass: 12,
  hitPoints: 9,
  hitDice: "2d8",
  speed: "30 ft.",
  abilities: { str: 11, dex: 12, con: 10, int: 10, wis: 11, cha: 10 },
  skills: ["Deception +2", "Religion +2"],
  senses: "passive Perception 10",
  languages: "any one language (usually Common)",
  challengeRating: "1/8",
  experiencePoints: 25,
  traits: [
    { 
      name: "Dark Devotion", 
      description: "The cultist has advantage on saving throws against being charmed or frightened." 
    },
  ],
  actions: [
    { 
      name: "Scimitar", 
      description: "Melee Weapon Attack: +3 to hit, reach 5 ft., one creature. Hit: 4 (1d6 + 1) slashing damage." 
    },
  ],
};
