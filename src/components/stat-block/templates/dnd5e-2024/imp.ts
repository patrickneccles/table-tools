import type { DnD5e2024Data } from "../../systems/dnd5e-2024/types";

export const impTemplate: DnD5e2024Data = {
  name: "Imp",
  size: "Tiny",
  type: "fiend (devil)",
  alignment: "lawful evil",
  armorClass: 13,
  initiative: 3,
  hitPoints: 21,
  hitDice: "6d4 + 6",
  speed: "20 ft., fly 40 ft.",
  abilities: { str: 6, dex: 17, con: 13, int: 11, wis: 12, cha: 14 },
  skills: ["Deception +4", "Insight +3", "Stealth +5"],
  resistances: "Cold",
  immunities: "Fire, Poison; Poisoned",
  senses: "darkvision 120 ft. (unimpeded by magical Darkness), passive Perception 11",
  languages: "Common, Infernal",
  challengeRating: "1",
  experiencePoints: 200,
  proficiencyBonus: 2,
  traits: [
    { name: "Magic Resistance", description: "The imp has Advantage on saving throws against spells and other magical effects." },
  ],
  actions: [
    { name: "Sting", description: "Melee Attack Roll: +5, reach 5 ft. Hit: 6 (1d6 + 3) Piercing damage plus 7 (2d6) Poison damage." },
    { name: "Invisibility", description: "The imp casts Invisibility on itself, requiring no spell components and using Charisma as the spellcasting ability." },
    { name: "Shape-Shift", description: "The imp shape-shifts to resemble a rat (Speed 20 ft.), a raven (20 ft., Fly 60 ft.), or a spider (20 ft., Climb 20 ft.), or returns to its true form. Statistics are the same in each form, except for Speed." },
  ],
};
