// Legacy exports (for backwards compatibility with existing code)
export { StatBlockView } from "./stat-block-view";
export { 
  TraitEditor,
  EditorCard,
  TextInput,
  NumberInput,
  FormField,
  getInputClassName,
  getInputWithPlaceholderClassName,
} from "./stat-block-editor";
export { 
  defaultStatBlock,
  ABILITY_KEYS,
  TRAIT_SECTION_KEYS,
  TRAIT_SECTION_LABELS,
  calculateModifier,
  formatModifier,
} from "./types";
export {
  CR_XP_TABLE,
  getXPForCR,
  getCRForXP,
  parseHitDice,
  calculateAverageHP,
  generateHitDice,
  saveStatBlockToStorage,
  loadStatBlockFromStorage,
  clearStatBlockStorage,
} from "./stat-block-utils";
export type { 
  StatBlockData,
  AbilityKey,
  AbilityScores,
  TraitEntry,
  TraitSectionKey,
} from "./types";
export type { StatBlockTemplate } from "./stat-block-utils";

// Templates
export {
  STAT_BLOCK_TEMPLATES,
  DND5E_2014_TEMPLATES,
  DND5E_2024_TEMPLATES,
} from "./templates";

// New system-based exports
export { SystemStatBlockView } from "./system-stat-block-view";
export { SystemSelector } from "./system-selector";
export type {
  SystemMetadata,
  SystemRendererProps,
  StatBlockSystem,
  SystemRegistry,
} from "./systems/base-system";
export {
  SYSTEM_REGISTRY,
  DEFAULT_SYSTEM_ID,
  getSystem,
  getAllSystems,
  getAllSystemMetadata,
  transformBetweenSystems,
  canTransform,
} from "./systems/registry";

// D&D 5e systems
export type { DnD5e2014Data } from "./systems/dnd5e-2014";
export type { DnD5e2024Data } from "./systems/dnd5e-2024";
export { DnD5e2014Renderer } from "./systems/dnd5e-2014";
export { DnD5e2024Renderer } from "./systems/dnd5e-2024";
