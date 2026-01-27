// Legacy exports (D&D 5e-specific helpers still in use)
export { 
  TraitEditor,
  EditorCard,
  TextInput,
  NumberInput,
  FormField,
  getInputClassName,
  getInputWithPlaceholderClassName,
} from "./stat-block-editor";

// Dynamic editor
export { DynamicEditor } from "./dynamic-editor";
export { 
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
  saveSystemToStorage,
  loadSystemFromStorage,
} from "./stat-block-utils";
export type { 
  AbilityKey,
  AbilityScores,
  TraitEntry,
  TraitSectionKey,
} from "./types";
export type { StatBlockTemplate, BaseStatBlockData } from "./stat-block-utils";

// Templates
export {
  STAT_BLOCK_TEMPLATES,
  DND5E_2014_TEMPLATES,
  DND5E_2024_TEMPLATES,
  SHADOWDARK_TEMPLATES,
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

// Shadowdark system
export type { ShadowdarkData } from "./systems/shadowdark";
export { ShadowdarkRenderer } from "./systems/shadowdark";
