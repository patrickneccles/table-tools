/**
 * D&D 5e 2024 Edition System Definition
 */

import type { StatBlockSystem } from "../base-system";
import type { DnD5e2024Data } from "./types";
import type { DnD5e2014Data } from "../dnd5e-2014/types";
import { DnD5e2024Renderer } from "./renderer";
import { calculateInitiative, calculateProficiencyBonus } from "./types";

/**
 * Transform a 2014 stat block to 2024 format
 */
function transformFrom2014(data: DnD5e2014Data): DnD5e2024Data {
  // Calculate new 2024 fields
  const initiative = calculateInitiative(data.abilityScores.dex);
  const proficiencyBonus = calculateProficiencyBonus(data.challengeRating);

  // Combine damage resistances/immunities and condition immunities into single immunities field
  const immunities = [
    data.damageImmunities,
    data.conditionImmunities,
  ].filter(Boolean).join("; ");

  return {
    // Basic info (unchanged)
    name: data.name,
    size: data.size,
    type: data.type,
    alignment: data.alignment,

    // Combat stats (with new initiative)
    armorClass: data.armorClass,
    armorType: data.armorType,
    initiative: initiative.modifier,
    hitPoints: data.hitPoints,
    hitDice: data.hitDice,
    speed: data.speed,

    // Ability Scores (unchanged)
    abilityScores: { ...data.abilityScores },

    // Proficiencies (unchanged)
    savingThrows: data.savingThrows ? [...data.savingThrows] : undefined,
    skills: data.skills ? [...data.skills] : undefined,

    // Resistances/Immunities (reorganized)
    resistances: data.damageResistances,
    vulnerabilities: data.damageVulnerabilities,
    immunities: immunities || undefined,

    // Gear (new in 2024, empty by default)
    gear: undefined,

    // Senses & Languages (unchanged)
    senses: data.senses,
    languages: data.languages,

    // Challenge (with new PB)
    challengeRating: data.challengeRating,
    experiencePoints: data.experiencePoints,
    proficiencyBonus,

    // Traits (unchanged)
    traits: data.traits ? [...data.traits] : undefined,
    actions: data.actions ? [...data.actions] : undefined,
    bonusActions: data.bonusActions ? [...data.bonusActions] : undefined,
    reactions: data.reactions ? [...data.reactions] : undefined,
    legendaryActions: data.legendaryActions ? [...data.legendaryActions] : undefined,

    // Lore (unchanged)
    description: data.description,
  };
}

export const dnd5e2024System: StatBlockSystem<DnD5e2024Data> = {
  schema: {
    metadata: {
      id: "dnd5e-2024",
      name: "D&D 5e (2024)",
      description: "Updated 2024 Core Rules format",
      version: "5.5",
    },
    defaultData: {
      name: "New Creature",
      size: "Medium",
      type: "humanoid",
      alignment: "neutral",
      armorClass: 10,
      initiative: 0,
      hitPoints: 4,
      hitDice: "1d8",
      speed: "30 ft.",
      abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      challengeRating: "0",
      experiencePoints: 10,
      proficiencyBonus: 2,
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
          { key: "armorClass", label: "AC", type: "number" },
          { key: "armorType", label: "AC Type", type: "text", placeholder: "e.g., natural armor" },
          { key: "initiative", label: "Initiative", type: "number", helpText: "Auto-calculated from DEX if empty" },
          { key: "hitPoints", label: "HP", type: "number" },
          { key: "hitDice", label: "Hit Dice", type: "text", placeholder: "e.g., 4d8 + 4" },
          { key: "speed", label: "Speed", type: "text" },
        ],
      },
      {
        key: "abilityScores",
        title: "Ability Scores",
        fields: [
          { key: "abilityScores.str", label: "STR", type: "number" },
          { key: "abilityScores.dex", label: "DEX", type: "number" },
          { key: "abilityScores.con", label: "CON", type: "number" },
          { key: "abilityScores.int", label: "INT", type: "number" },
          { key: "abilityScores.wis", label: "WIS", type: "number" },
          { key: "abilityScores.cha", label: "CHA", type: "number" },
        ],
      },
      {
        key: "proficiencies",
        title: "Proficiencies",
        defaultCollapsed: true,
        fields: [
          { key: "savingThrows", label: "Saving Throws", type: "textarea", placeholder: "One per line:\nDex +5\nCon +4" },
          { key: "skills", label: "Skills", type: "textarea", placeholder: "One per line:\nStealth +6\nPerception +3" },
        ],
      },
      {
        key: "defenses",
        title: "Defenses & Resistances",
        defaultCollapsed: true,
        fields: [
          { key: "resistances", label: "Resistances", type: "textarea", placeholder: "e.g., Cold" },
          { key: "vulnerabilities", label: "Vulnerabilities", type: "textarea", placeholder: "e.g., Fire" },
          { key: "immunities", label: "Immunities", type: "textarea", placeholder: "e.g., Poison; Poisoned" },
          { key: "gear", label: "Gear", type: "text", placeholder: "e.g., Leather Armor, Sickle" },
        ],
      },
      {
        key: "senses",
        title: "Senses & Languages",
        fields: [
          { key: "senses", label: "Senses", type: "text", placeholder: "e.g., passive Perception 10" },
          { key: "languages", label: "Languages", type: "text", placeholder: "e.g., Common" },
        ],
      },
      {
        key: "challenge",
        title: "Challenge Rating",
        fields: [
          { key: "challengeRating", label: "CR", type: "text" },
          { key: "experiencePoints", label: "XP", type: "number" },
          { key: "proficiencyBonus", label: "Proficiency Bonus", type: "number", helpText: "Auto-calculated from CR if empty" },
        ],
      },
      {
        key: "description",
        title: "Description",
        defaultCollapsed: true,
        fields: [
          { key: "description", label: "Description", type: "textarea", placeholder: "Lore and background information" },
        ],
      },
    ],
    traitSections: ["traits", "actions", "bonusActions", "reactions", "legendaryActions"],
    transformFrom: (sourceSystem: string, sourceData: any) => {
      if (sourceSystem === "dnd5e-2014") {
        return transformFrom2014(sourceData as DnD5e2014Data);
      }
      return null;
    },
  },
  Renderer: DnD5e2024Renderer,
};
