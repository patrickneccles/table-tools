import type { StatBlockSystem } from '@/components/stat-block/systems/base-system';
import { GenericSpellRenderer } from './renderer';
import type { GenericSpellData } from './types';
import { SPELL_LEVEL_OPTIONS, SPELL_SCHOOL_OPTIONS } from './types';

const DEFAULT_SPELL: GenericSpellData = {
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
};

export const genericSpellSystem: StatBlockSystem<GenericSpellData> = {
  schema: {
    metadata: {
      id: 'generic',
      name: 'Generic',
      description: 'Generic spell block format',
      version: '1.0',
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
  Renderer: GenericSpellRenderer,
};
