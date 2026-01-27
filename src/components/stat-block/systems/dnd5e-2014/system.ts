/**
 * D&D 5e 2014 Edition System Definition
 */

import type { StatBlockSystem } from "../base-system";
import type { DnD5e2014Data } from "./types";
import { DnD5e2014Renderer } from "./renderer";

export const dnd5e2014System: StatBlockSystem<DnD5e2014Data> = {
  schema: {
    metadata: {
      id: "dnd5e-2014",
      name: "D&D 5e (2014)",
      description: "Classic 2014 Monster Manual format",
      version: "5.0",
    },
    defaultData: {
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
    },
    sections: [
      {
        key: "basic",
        title: "Basic Information",
        fields: [
          { key: "name", label: "Name", type: "text" },
          { key: "size", label: "Size", type: "text" },
          { key: "type", label: "Type", type: "text" },
          { key: "alignment", label: "Alignment", type: "text" },
        ],
      },
      {
        key: "combat",
        title: "Combat Statistics",
        fields: [
          { key: "armorClass", label: "Armor Class", type: "number" },
          { key: "armorType", label: "AC Type", type: "text", placeholder: "e.g., natural armor" },
          { key: "hitPoints", label: "Hit Points", type: "number" },
          { key: "hitDice", label: "Hit Dice", type: "text", placeholder: "e.g., 4d8 + 4" },
          { key: "speed", label: "Speed", type: "text" },
        ],
      },
      {
        key: "abilities",
        title: "Ability Scores",
        fields: [
          { key: "abilities.str", label: "STR", type: "number" },
          { key: "abilities.dex", label: "DEX", type: "number" },
          { key: "abilities.con", label: "CON", type: "number" },
          { key: "abilities.int", label: "INT", type: "number" },
          { key: "abilities.wis", label: "WIS", type: "number" },
          { key: "abilities.cha", label: "CHA", type: "number" },
        ],
      },
    ],
  },
  Renderer: DnD5e2014Renderer,
};
