import type { ShadowdarkData } from "../../systems/shadowdark/types";

export const goblinStatBlock: ShadowdarkData = {
  name: "Goblin",
  description: "A short, hairless humanoid with green skin and pointy ears.",
  armorClass: 11,
  hitPoints: 5,
  attack: "1 club +0 (1d4) or 1 shortbow (far) +1 (1d4)",
  movement: "near",
  abilityScores: {
    str: 0,
    dex: 1,
    con: 1,
    int: -1,
    wis: -1,
    cha: -2,
  },
  alignment: "C",
  level: 1,
  features: [
    {
      name: "Keen Senses",
      description: "Can't be surprised.",
    },
  ],
};
