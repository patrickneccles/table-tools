import type { ShadowdarkData } from "../../systems/shadowdark/types";

export const cultistStatBlock: ShadowdarkData = {
  name: "Cultist",
  description: "A cloaked, wild-eyed zealot chanting the guttural prayers of a dark god.",
  armorClass: 14,
  hitPoints: 9,
  attack: "1 longsword +1 (1d8) or 1 spell +2",
  movement: "near",
  abilityScores: {
    str: 1,
    dex: -1,
    con: 0,
    int: -1,
    wis: 2,
    cha: 0,
  },
  alignment: "C",
  level: 2,
  features: [
    {
      name: "Fearless",
      description: "Immune to morale checks.",
    },
    {
      name: "Deathtouch (WIS Spell)",
      description: "DC 12. 2d4 damage to one creature within close.",
    },
  ],
};
