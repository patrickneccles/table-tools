/**
 * Stat Block Templates
 * Loads all JSON templates from system subdirectories via a single require.context.
 */

import { loadTemplatesFromContext } from "../stat-block-utils";
import type { StatBlockTemplate } from "../stat-block-utils";
import type { BaseStatBlockData } from "../stat-block-utils";
import type { DnD5e2014Data } from "../systems";
import type { DnD5e2024Data } from "../systems/dnd5e-2024/types";
import type { ShadowdarkData } from "../systems/shadowdark/types";

type RequireContext = {
  keys: () => string[];
  (key: string): unknown;
};

// Load all JSON templates from all system subdirectories (dnd5e-2014, dnd5e-2024, shadowdark)
const templateContext = (
  require as unknown as { context: (dir: string, subdirs: boolean, re: RegExp) => RequireContext }
).context("./", true, /\.json$/);

const allTemplates = loadTemplatesFromContext<BaseStatBlockData>(templateContext);

// Partition by systemId and sort each list by name
const DND5E_2014_TEMPLATES: StatBlockTemplate<DnD5e2014Data>[] = allTemplates
  .filter((t): t is StatBlockTemplate<DnD5e2014Data> => t.systemId === "dnd5e-2014")
  .sort((a, b) => a.name.localeCompare(b.name));

const DND5E_2024_TEMPLATES: StatBlockTemplate<DnD5e2024Data>[] = allTemplates
  .filter((t): t is StatBlockTemplate<DnD5e2024Data> => t.systemId === "dnd5e-2024")
  .sort((a, b) => a.name.localeCompare(b.name));

const SHADOWDARK_TEMPLATES: StatBlockTemplate<ShadowdarkData>[] = allTemplates
  .filter((t): t is StatBlockTemplate<ShadowdarkData> => t.systemId === "shadowdark")
  .sort((a, b) => a.name.localeCompare(b.name));

export const STAT_BLOCK_TEMPLATES = [
  ...DND5E_2014_TEMPLATES,
  ...DND5E_2024_TEMPLATES,
  ...SHADOWDARK_TEMPLATES,
];

export { DND5E_2014_TEMPLATES, DND5E_2024_TEMPLATES, SHADOWDARK_TEMPLATES };
export type { StatBlockTemplate } from "../stat-block-utils";
