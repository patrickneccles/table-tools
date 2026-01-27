import type { DnD5e2024Data } from "../../systems/dnd5e-2024/types";

export const goblinWarriorTemplate: DnD5e2024Data = {
  name: "Goblin Warrior",
  size: "Small",
  type: "fey (goblinoid)",
  alignment: "chaotic neutral",
  armorClass: 15,
  armorType: "leather armor, shield",
  initiative: 2,
  hitPoints: 10,
  hitDice: "3d6",
  speed: "30 ft.",
  abilityScores: { str: 8, dex: 15, con: 10, int: 10, wis: 8, cha: 8 },
  skills: ["Stealth +6"],
  gear: "Leather Armor, Scimitar, Shield, Shortbow",
  senses: "darkvision 60 ft., passive Perception 9",
  languages: "Common, Goblin",
  challengeRating: "1/4",
  experiencePoints: 50,
  proficiencyBonus: 2,
  traits: [],
  actions: [
    { 
      name: "Scimitar", 
      description: "Melee Attack Roll: +4, reach 5 ft. Hit: 5 (1d6 + 2) Slashing damage, plus 2 (1d4) Slashing damage if the attack roll had Advantage." 
    },
    { 
      name: "Shortbow", 
      description: "Ranged Attack Roll: +4, range 80/320 ft. Hit: 5 (1d6 + 2) Piercing damage, plus 2 (1d4) Piercing damage if the attack roll had Advantage." 
    },
  ],
  bonusActions: [
    { 
      name: "Nimble Escape", 
      description: "The goblin takes the Disengage or Hide action." 
    },
  ],
};
