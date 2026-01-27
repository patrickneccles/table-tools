import type { StatBlockData } from "../../types";

export const trollTemplate: StatBlockData = {
  name: "Troll",
  size: "Large",
  type: "giant",
  alignment: "chaotic evil",
  armorClass: 15,
  armorType: "natural armor",
  hitPoints: 84,
  hitDice: "8d10 + 40",
  speed: "30 ft.",
  abilities: { str: 18, dex: 13, con: 20, int: 7, wis: 9, cha: 7 },
  skills: ["Perception +2"],
  senses: "darkvision 60 ft., passive Perception 12",
  languages: "Giant",
  challengeRating: "5",
  experiencePoints: 1800,
  traits: [
    { name: "Keen Smell", description: "The troll has advantage on Wisdom (Perception) checks that rely on smell." },
    { name: "Regeneration", description: "The troll regains 10 hit points at the start of its turn. If the troll takes acid or fire damage, this trait doesn't function at the start of the troll's next turn. The troll dies only if it starts its turn with 0 hit points and doesn't regenerate." },
  ],
  actions: [
    { name: "Multiattack", description: "The troll makes three attacks: one with its bite and two with its claws." },
    { name: "Bite", description: "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 7 (1d6 + 4) piercing damage." },
    { name: "Claw", description: "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage." },
  ],
};
