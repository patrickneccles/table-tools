import type { StatBlockSystem } from '@/components/stat-block/systems/base-system';
import { DnD5e2024SpellRenderer } from './renderer';
import type { DnD5e2024SpellData } from './types';
import {
  ATTACK_TYPE_OPTIONS,
  SAVE_TYPE_OPTIONS,
  SPELL_LEVEL_OPTIONS,
  SPELL_SCHOOL_OPTIONS,
} from './types';

const DEFAULT_SPELL: DnD5e2024SpellData = {
  name: 'New Spell',
  level: 'cantrip',
  school: 'Evocation',
  castingTime: 'Action',
  range: '30 ft.',
  components: 'V',
  duration: 'Instantaneous',
  classes: '',
  description: '',
  atHigherLevels: '',
  source: '',
  attackType: '',
  saveType: '',
  damageType: '',
};

export const dnd5e2024SpellSystem: StatBlockSystem<DnD5e2024SpellData> = {
  schema: {
    metadata: {
      id: 'dnd5e-2024',
      name: 'D&D 5e (2024)',
      description: "Player's Handbook 2024 spell format",
      version: '5.5',
    },
    defaultData: DEFAULT_SPELL,
    sections: [
      {
        key: 'identity',
        title: 'Identity',
        fields: [
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'level', label: 'Level', type: 'select', options: [...SPELL_LEVEL_OPTIONS] },
          { key: 'school', label: 'School', type: 'select', options: SPELL_SCHOOL_OPTIONS },
          {
            key: 'source',
            label: 'Source',
            type: 'text',
            placeholder: "e.g. Player's Handbook, pg. 318",
          },
        ],
      },
      {
        key: 'casting',
        title: 'Casting',
        fields: [
          {
            key: 'castingTime',
            label: 'Casting Time',
            type: 'text',
            placeholder: 'e.g. Action, or 1 minute (Ritual)',
          },
          { key: 'range', label: 'Range', type: 'text', placeholder: 'e.g. 120 ft.' },
          {
            key: 'components',
            label: 'Components',
            type: 'text',
            placeholder: 'e.g. V, S, M (a tiny ball of bat guano)',
          },
          {
            key: 'duration',
            label: 'Duration',
            type: 'text',
            placeholder: 'e.g. Instantaneous, or Concentration, up to 1 minute',
          },
        ],
      },
      {
        key: 'details',
        title: 'Details',
        fields: [
          {
            key: 'classes',
            label: 'Classes',
            type: 'text',
            placeholder: 'e.g. Sorcerer, Wizard',
          },
          {
            key: 'attackType',
            label: 'Attack Type',
            type: 'select',
            options: ATTACK_TYPE_OPTIONS,
          },
          { key: 'saveType', label: 'Save Type', type: 'select', options: SAVE_TYPE_OPTIONS },
          {
            key: 'damageType',
            label: 'Damage Type',
            type: 'text',
            placeholder: 'e.g. Fire, or Acid / Cold / Fire',
          },
        ],
      },
      {
        key: 'description',
        title: 'Description',
        fields: [
          { key: 'description', label: 'Description', type: 'textarea' },
          {
            key: 'atHigherLevels',
            label: 'At Higher Levels / Cantrip Scaling',
            type: 'textarea',
          },
        ],
      },
    ],
  },
  Renderer: DnD5e2024SpellRenderer,
};
