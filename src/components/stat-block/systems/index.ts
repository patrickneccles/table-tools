/**
 * Stat Block Systems
 * 
 * Export all systems and system-related utilities.
 */

// Base system types
export type { 
  SystemMetadata,
  FieldDefinition,
  SectionDefinition,
  SystemSchema,
  SystemRendererProps,
  StatBlockSystem,
  SystemRegistry,
} from "./base-system";

// Registry and utilities
export {
  SYSTEM_REGISTRY,
  DEFAULT_SYSTEM_ID,
  getSystem,
  getAllSystems,
  getAllSystemMetadata,
  transformBetweenSystems,
  canTransform,
} from "./registry";

// D&D 5e 2014
export type { DnD5e2014Data } from "./dnd5e-2014/types";
export { DnD5e2014Renderer } from "./dnd5e-2014/renderer";
export { dnd5e2014System } from "./dnd5e-2014/system";

// D&D 5e 2024
export type { DnD5e2024Data } from "./dnd5e-2024/types";
export { DnD5e2024Renderer } from "./dnd5e-2024/renderer";
export { dnd5e2024System } from "./dnd5e-2024/system";

// Shadowdark RPG
export type { ShadowdarkData } from "./shadowdark/types";
export { ShadowdarkRenderer } from "./shadowdark/renderer";
export { shadowdarkSystem } from "./shadowdark/system";
