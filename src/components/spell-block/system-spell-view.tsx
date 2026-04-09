'use client';

import type { StatBlockSystem } from '@/components/stat-block/systems/base-system';
import { getSpellSystem } from './systems/registry';

interface SystemSpellViewProps {
  systemId: string;
  data: Record<string, unknown>;
  className?: string;
}

export function SystemSpellView({ systemId, data, className }: SystemSpellViewProps) {
   
  const system = getSpellSystem(systemId) as StatBlockSystem<Record<string, unknown>> | undefined;
  if (!system) return null;
  const { Renderer } = system;
  return <Renderer data={data} className={className} />;
}
