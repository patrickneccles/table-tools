import type { DnD5e2024Data } from "../../systems/dnd5e-2024/types";

export const cultistTemplate: DnD5e2024Data = {
  name: "Cultist",
  size: "Medium",
  type: "humanoid",
  alignment: "neutral",
  armorClass: 12,
  initiative: 1,
  hitPoints: 9,
  hitDice: "2d8",
  speed: "30 ft.",
  abilities: { str: 11, dex: 12, con: 10, int: 10, wis: 11, cha: 10 },
  skills: ["Deception +2", "Religion +2"],
  senses: "passive Perception 10",
  languages: "Common",
  challengeRating: "1/8",
  experiencePoints: 25,
  proficiencyBonus: 2,
  gear: "Leather Armor, Sickle",
  actions: [
    { 
      name: "Ritual Sickle", 
      description: "Melee Attack Roll: +3, reach 5 ft. Hit: 3 (1d4 + 1) Slashing damage plus 1 Necrotic damage." 
    },
  ],
};
