import type { DnD5e2014Data } from "../../systems";

export const goblinTemplate: DnD5e2014Data = {
  name: "Goblin",
  size: "Small",
  type: "humanoid (goblinoid)",
  alignment: "neutral evil",
  armorClass: 15,
  armorType: "leather armor, shield",
  hitPoints: 7,
  hitDice: "2d6",
  speed: "30 ft.",
  abilityScores: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
  skills: ["Stealth +6"],
  senses: "darkvision 60 ft., passive Perception 9",
  languages: "Common, Goblin",
  challengeRating: "1/4",
  experiencePoints: 50,
  traits: [
    { name: "Nimble Escape", description: "The goblin can take the Disengage or Hide action as a bonus action on each of its turns." },
  ],
  actions: [
    { name: "Scimitar", description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage." },
    { name: "Shortbow", description: "Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage." },
  ],
};
