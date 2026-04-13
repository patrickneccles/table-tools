/**
 * Shadowdark RPG System Definition
 */

import type { StatBlockSystem } from '../base-system';
import type { ShadowdarkData } from './types';
import { ShadowdarkRenderer } from './renderer';
import { generateShadowdarkMarkdown } from './markdown';

export const shadowdarkSystem: StatBlockSystem<ShadowdarkData> = {
  schema: {
    metadata: {
      id: 'shadowdark',
      name: 'Shadowdark RPG',
      description: 'Streamlined old-school fantasy',
      version: '1.0',
    },
    defaultData: {
      name: 'New Monster',
      description: 'A mysterious creature.',
      armorClass: 10,
      hitPoints: 5,
      attack: '1 weapon +0 (1d6)',
      movement: 'near',
      abilityScores: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
      alignment: 'N',
      level: 1,
      features: '',
    },
    sections: [
      {
        key: 'basic',
        title: 'Basic Information',
        fields: [
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' },
        ],
      },
      {
        key: 'stats',
        title: 'Core Statistics',
        fields: [
          { key: 'armorClass', label: 'Armor Class', type: 'number' },
          { key: 'hitPoints', label: 'Hit Points', type: 'number' },
          { key: 'attack', label: 'Attack', type: 'text', placeholder: 'e.g., 2 claw +2 (1d4)' },
          {
            key: 'movement',
            label: 'Movement',
            type: 'text',
            placeholder: 'e.g., near, far, close',
            helpText: 'Distance bands: near, close, far',
          },
          { key: 'alignment', label: 'Alignment', type: 'text', placeholder: 'L, N, C' },
          { key: 'level', label: 'Level', type: 'number' },
        ],
      },
      {
        key: 'abilityScores',
        title: 'Ability Modifiers',
        fields: [
          {
            key: 'abilityScores.str',
            label: 'STR',
            type: 'number',
            helpText: 'Modifier (e.g. +2 or –1), not raw score',
          },
          { key: 'abilityScores.dex', label: 'DEX', type: 'number' },
          { key: 'abilityScores.con', label: 'CON', type: 'number' },
          { key: 'abilityScores.int', label: 'INT', type: 'number' },
          { key: 'abilityScores.wis', label: 'WIS', type: 'number' },
          { key: 'abilityScores.cha', label: 'CHA', type: 'number' },
        ],
      },
      {
        key: 'features',
        title: 'Features',
        fields: [
          {
            key: 'features',
            label: 'Features',
            type: 'markdown',
            placeholder:
              "**Keen Senses.** Can't be surprised.\n\n**Fearless.** Immune to morale checks.",
            insertTemplates: [{ label: 'Feature', template: '**Name.** Description.' }],
          },
        ],
      },
    ],
  },
  Renderer: ShadowdarkRenderer,
  generateMarkdown: generateShadowdarkMarkdown,
};
