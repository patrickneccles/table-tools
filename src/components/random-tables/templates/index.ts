import type { RandomTableData } from '../random-table-utils';
import npcQuirks from './npc-quirks.json';
import dungeonEncounters from './dungeon-encounters.json';
import urbanEncounters from './urban-encounters.json';

export type RandomTableTemplate = {
  id: string;
  name: string;
  data: RandomTableData;
};

function withFreshIds(data: RandomTableData): RandomTableData {
  return {
    ...data,
    entries: data.entries.map((e) => ({ ...e, id: crypto.randomUUID() })),
  };
}

export const TEMPLATES: RandomTableTemplate[] = [
  { id: 'npc-quirks', name: 'NPC Quirks (d20)', data: npcQuirks as RandomTableData },
  {
    id: 'dungeon-encounters',
    name: 'Dungeon Encounters (2d6)',
    data: dungeonEncounters as RandomTableData,
  },
  {
    id: 'urban-encounters',
    name: 'Urban Encounters (d12)',
    data: urbanEncounters as RandomTableData,
  },
];

export function loadTemplate(template: RandomTableTemplate): RandomTableData {
  return withFreshIds(template.data);
}
