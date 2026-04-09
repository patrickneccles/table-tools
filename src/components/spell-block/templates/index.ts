/**
 * Spell Block Templates
 * Loads all JSON templates from system subdirectories via a single require.context.
 */

import { loadTemplatesFromContext } from '@/components/stat-block/stat-block-utils';
import type { StatBlockTemplate } from '@/components/stat-block/stat-block-utils';
import type { BaseStatBlockData } from '@/components/stat-block/stat-block-utils';
import type { DnD5e2024SpellData } from '../systems/dnd5e-2024/types';

type RequireContext = {
  keys: () => string[];
  (key: string): unknown;
};

const templateContext = (
  require as unknown as { context: (dir: string, subdirs: boolean, re: RegExp) => RequireContext }
).context('./', true, /\.json$/);

const allTemplates = loadTemplatesFromContext<BaseStatBlockData>(templateContext);

const DND5E_2024_SPELL_TEMPLATES: StatBlockTemplate<DnD5e2024SpellData>[] = allTemplates
  .filter((t): t is StatBlockTemplate<DnD5e2024SpellData> => t.systemId === 'dnd5e-2024')
  .sort((a, b) => a.name.localeCompare(b.name));

export const SPELL_BLOCK_TEMPLATES = [...DND5E_2024_SPELL_TEMPLATES];

export { DND5E_2024_SPELL_TEMPLATES };
export type { StatBlockTemplate };
