/**
 * Stat Block Templates
 * Organized by game system
 */

import { DND5E_2014_TEMPLATES } from "./dnd5e-2014";
import { DND5E_2024_TEMPLATES } from "./dnd5e-2024";
import { SHADOWDARK_TEMPLATES } from "./shadowdark";

// Export all templates as a single array
export const STAT_BLOCK_TEMPLATES = [
  ...DND5E_2014_TEMPLATES,
  ...DND5E_2024_TEMPLATES,
  ...SHADOWDARK_TEMPLATES,
];

// Re-export system-specific template arrays
export { DND5E_2014_TEMPLATES, DND5E_2024_TEMPLATES, SHADOWDARK_TEMPLATES };

// Re-export the StatBlockTemplate type for convenience
export type { StatBlockTemplate } from "../stat-block-utils";
