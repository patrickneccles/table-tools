import type { StatBlockSystem } from '@/components/stat-block/systems/base-system';
import { DnD5e2024SpellRenderer } from './renderer';
import type { DnD5e2024SpellData } from './types';
import { SPELL_LEVEL_OPTIONS, SPELL_SCHOOL_OPTIONS } from './types';
import { generateDnD5e2024SpellMarkdown } from './markdown';

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
  source: '',
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
        title: 'Basic Information',
        fields: [
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'level', label: 'Level', type: 'select', options: [...SPELL_LEVEL_OPTIONS] },
          { key: 'school', label: 'School', type: 'select', options: SPELL_SCHOOL_OPTIONS },
          { key: 'classes', label: 'Classes', type: 'text', placeholder: 'e.g. Sorcerer, Wizard' },
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
        key: 'description',
        title: 'Description',
        fields: [
          {
            key: 'description',
            label: 'Description',
            type: 'markdown',
            placeholder:
              'Supports **bold**, *italic*, and tables.\n\n**Feature Name.** Description of the feature.',
          },
        ],
      },
    ],
  },
  Renderer: DnD5e2024SpellRenderer,
  generateMarkdown: generateDnD5e2024SpellMarkdown,
};
