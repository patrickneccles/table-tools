import type { StatBlockData } from "../../types";

export const blankTemplate: StatBlockData = {
  name: "New Creature",
  size: "Medium",
  type: "humanoid",
  alignment: "neutral",
  armorClass: 10,
  hitPoints: 4,
  hitDice: "1d8",
  speed: "30 ft.",
  abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  challengeRating: "0",
  experiencePoints: 10,
};
