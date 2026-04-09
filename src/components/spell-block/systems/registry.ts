import type { StatBlockSystem, SystemMetadata } from '@/components/stat-block/systems/base-system';
import { dnd5e2024SpellSystem } from './dnd5e-2024';
import { shadowdarkSpellSystem } from './shadowdark';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SPELL_SYSTEM_REGISTRY: Record<string, StatBlockSystem<any>> = {
  'dnd5e-2024': dnd5e2024SpellSystem,
  shadowdark: shadowdarkSpellSystem,
};

export const DEFAULT_SPELL_SYSTEM_ID = 'dnd5e-2024';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSpellSystem(systemId: string): StatBlockSystem<any> | undefined {
  return SPELL_SYSTEM_REGISTRY[systemId];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAllSpellSystems(): StatBlockSystem<any>[] {
  return Object.values(SPELL_SYSTEM_REGISTRY);
}

export function getAllSpellSystemMetadata(): SystemMetadata[] {
  return Object.values(SPELL_SYSTEM_REGISTRY).map((s) => s.schema.metadata);
}
