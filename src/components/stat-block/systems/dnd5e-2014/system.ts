/**
 * D&D 5e 2014 Edition System Definition
 */

import type { StatBlockSystem } from '../base-system';
import type { DnD5e2014Data } from './types';
import { DnD5e2014Renderer } from './renderer';

const TRAIT_PLACEHOLDER =
  '**Feature Name.** Description of the feature.\n\n**Another Feature.** Description here.';
const ACTION_PLACEHOLDER =
  '**Multiattack.** The creature makes two attacks.\n\n**Strike.** *Melee Weapon Attack:* +5 to hit, reach 5 ft., one target. *Hit:* 7 (1d8 + 3) bludgeoning damage.';

export const dnd5e2014System: StatBlockSystem<DnD5e2014Data> = {
  schema: {
    metadata: {
      id: 'dnd5e-2014',
      name: 'D&D 5e (2014)',
      description: 'Classic 2014 Monster Manual format',
      version: '5.0',
    },
    defaultData: {
      name: 'New Creature',
      size: 'Medium',
      type: 'humanoid',
      alignment: 'neutral',
      armorClass: 10,
      hitPoints: 4,
      hitDice: '1d8',
      speed: '30 ft.',
      abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      challengeRating: '0',
      experiencePoints: 10,
      traits: '',
      actions: '',
      bonusActions: '',
      reactions: '',
      legendaryActions: '',
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
          { key: 'armorClass', label: 'Armor Class', type: 'number' },
          { key: 'armorType', label: 'AC Type', type: 'text', placeholder: 'e.g., natural armor' },
          { key: 'hitPoints', label: 'Hit Points', type: 'number' },
          { key: 'hitDice', label: 'Hit Dice', type: 'text', placeholder: 'e.g., 4d8 + 4' },
          { key: 'speed', label: 'Speed', type: 'text' },
        ],
      },
      {
        key: 'abilityScores',
        title: 'Ability Scores',
        fields: [
          {
            key: 'abilityScores.str',
            label: 'STR',
            type: 'number',
            helpText: 'Raw score (3–20), not modifier',
          },
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
          {
            key: 'damageResistances',
            label: 'Damage Resistances',
            type: 'textarea',
            placeholder: 'e.g., cold, fire',
          },
          {
            key: 'damageVulnerabilities',
            label: 'Damage Vulnerabilities',
            type: 'textarea',
            placeholder: 'e.g., fire',
          },
          {
            key: 'damageImmunities',
            label: 'Damage Immunities',
            type: 'textarea',
            placeholder: 'e.g., poison',
          },
          {
            key: 'conditionImmunities',
            label: 'Condition Immunities',
            type: 'textarea',
            placeholder: 'e.g., poisoned',
          },
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
        ],
      },
      {
        key: 'traits',
        title: 'Traits',
        fields: [
          { key: 'traits', label: 'Traits', type: 'markdown', placeholder: TRAIT_PLACEHOLDER },
        ],
      },
      {
        key: 'actions',
        title: 'Actions',
        fields: [
          { key: 'actions', label: 'Actions', type: 'markdown', placeholder: ACTION_PLACEHOLDER },
        ],
      },
      {
        key: 'bonusActions',
        title: 'Bonus Actions',
        defaultCollapsed: true,
        fields: [
          {
            key: 'bonusActions',
            label: 'Bonus Actions',
            type: 'markdown',
            placeholder: TRAIT_PLACEHOLDER,
          },
        ],
      },
      {
        key: 'reactions',
        title: 'Reactions',
        defaultCollapsed: true,
        fields: [
          {
            key: 'reactions',
            label: 'Reactions',
            type: 'markdown',
            placeholder: TRAIT_PLACEHOLDER,
          },
        ],
      },
      {
        key: 'legendaryActions',
        title: 'Legendary Actions',
        defaultCollapsed: true,
        fields: [
          {
            key: 'legendaryActions',
            label: 'Legendary Actions',
            type: 'markdown',
            placeholder: TRAIT_PLACEHOLDER,
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
  },
  Renderer: DnD5e2014Renderer,
};
