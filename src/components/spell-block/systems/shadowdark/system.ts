import type { StatBlockSystem } from '@/components/stat-block/systems/base-system';
import { ShadowdarkSpellRenderer } from './renderer';
import type { ShadowdarkSpellData } from './types';
import { TIER_OPTIONS } from './types';

const DEFAULT_SPELL: ShadowdarkSpellData = {
  name: 'New Spell',
  tier: '1',
  classes: 'Wizard',
  duration: 'Instant',
  range: 'Near',
  description: '',
};

export const shadowdarkSpellSystem: StatBlockSystem<ShadowdarkSpellData> = {
  schema: {
    metadata: {
      id: 'shadowdark',
      name: 'Shadowdark',
      description: 'Shadowdark RPG spell format',
      version: '1.0',
    },
    defaultData: DEFAULT_SPELL,
    sections: [
      {
        key: 'identity',
        title: 'Basic Information',
        fields: [
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'tier', label: 'Tier', type: 'select', options: [...TIER_OPTIONS] },
          { key: 'classes', label: 'Class', type: 'text', placeholder: 'e.g. Wizard' },
        ],
      },
      {
        key: 'details',
        title: 'Details',
        fields: [
          {
            key: 'duration',
            label: 'Duration',
            type: 'text',
            placeholder: 'e.g. Instant, 10 rounds, 1d8 days',
          },
          { key: 'range', label: 'Range', type: 'text', placeholder: 'e.g. Self, Near, Far' },
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
  Renderer: ShadowdarkSpellRenderer,
};
