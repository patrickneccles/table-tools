/**
 * D&D 5e 2024 Edition System Definition
 */

import type { StatBlockSystem } from '../base-system';
import type { DnD5e2024Data } from './types';
import { DnD5e2024Renderer } from './renderer';

export const dnd5e2024System: StatBlockSystem<DnD5e2024Data> = {
  schema: {
    metadata: {
      id: 'dnd5e-2024',
      name: 'D&D 5e (2024)',
      description: 'Updated 2024 Core Rules format',
      version: '5.5',
    },
    defaultData: {
      name: 'New Creature',
      size: 'Medium',
      type: 'humanoid',
      alignment: 'neutral',
      armorClass: 10,
      initiative: 0,
      hitPoints: 4,
      hitDice: '1d8',
      speed: '30 ft.',
      abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      challengeRating: '0',
      experiencePoints: 10,
      proficiencyBonus: 2,
    },
    sections: [
      {
        key: 'basic',
        title: 'Basic Information',
        fields: [
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'size', label: 'Size', type: 'text' },
          { key: 'type', label: 'Type', type: 'text' },
          { key: 'alignment', label: 'Alignment', type: 'text' },
        ],
      },
      {
        key: 'combat',
        title: 'Combat Statistics',
        fields: [
          { key: 'armorClass', label: 'AC', type: 'number' },
          { key: 'armorType', label: 'AC Type', type: 'text', placeholder: 'e.g., natural armor' },
          {
            key: 'initiative',
            label: 'Initiative',
            type: 'number',
            helpText: 'Auto-calculated from DEX if empty',
          },
          { key: 'hitPoints', label: 'HP', type: 'number' },
          { key: 'hitDice', label: 'Hit Dice', type: 'text', placeholder: 'e.g., 4d8 + 4' },
          { key: 'speed', label: 'Speed', type: 'text' },
        ],
      },
      {
        key: 'abilityScores',
        title: 'Ability Scores',
        fields: [
          { key: 'abilityScores.str', label: 'STR', type: 'number' },
          { key: 'abilityScores.dex', label: 'DEX', type: 'number' },
          { key: 'abilityScores.con', label: 'CON', type: 'number' },
          { key: 'abilityScores.int', label: 'INT', type: 'number' },
          { key: 'abilityScores.wis', label: 'WIS', type: 'number' },
          { key: 'abilityScores.cha', label: 'CHA', type: 'number' },
        ],
      },
      {
        key: 'proficiencies',
        title: 'Proficiencies',
        defaultCollapsed: true,
        fields: [
          {
            key: 'savingThrows',
            label: 'Saving Throws',
            type: 'textarea',
            placeholder: 'One per line:\nDex +5\nCon +4',
          },
          {
            key: 'skills',
            label: 'Skills',
            type: 'textarea',
            placeholder: 'One per line:\nStealth +6\nPerception +3',
          },
        ],
      },
      {
        key: 'defenses',
        title: 'Defenses & Resistances',
        defaultCollapsed: true,
        fields: [
          { key: 'resistances', label: 'Resistances', type: 'textarea', placeholder: 'e.g., Cold' },
          {
            key: 'vulnerabilities',
            label: 'Vulnerabilities',
            type: 'textarea',
            placeholder: 'e.g., Fire',
          },
          {
            key: 'immunities',
            label: 'Immunities',
            type: 'textarea',
            placeholder: 'e.g., Poison; Poisoned',
          },
          { key: 'gear', label: 'Gear', type: 'text', placeholder: 'e.g., Leather Armor, Sickle' },
        ],
      },
      {
        key: 'senses',
        title: 'Senses & Languages',
        fields: [
          {
            key: 'senses',
            label: 'Senses',
            type: 'text',
            placeholder: 'e.g., passive Perception 10',
          },
          { key: 'languages', label: 'Languages', type: 'text', placeholder: 'e.g., Common' },
        ],
      },
      {
        key: 'challenge',
        title: 'Challenge Rating',
        fields: [
          {
            key: 'challengeRating',
            label: 'CR',
            type: 'text',
            helpText: 'e.g. 1/8, 1/4, 1/2, 1, 2',
          },
          { key: 'experiencePoints', label: 'XP', type: 'number' },
          {
            key: 'proficiencyBonus',
            label: 'Proficiency Bonus',
            type: 'number',
            helpText: 'Auto-calculated from CR if empty',
          },
        ],
      },
      {
        key: 'description',
        title: 'Description',
        defaultCollapsed: true,
        fields: [
          {
            key: 'description',
            label: 'Description',
            type: 'textarea',
            placeholder: 'Lore and background information',
          },
        ],
      },
    ],
    traitSections: ['traits', 'actions', 'bonusActions', 'reactions', 'legendaryActions'],
  },
  Renderer: DnD5e2024Renderer,
};
