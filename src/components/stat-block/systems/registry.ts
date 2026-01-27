/**
 * Stat Block System Registry
 * 
 * Central registry for all supported stat block systems.
 * Add new systems here to make them available throughout the app.
 */

import type { SystemRegistry } from "./base-system";
import { dnd5e2014System } from "./dnd5e-2014/system";
import { dnd5e2024System } from "./dnd5e-2024/system";

/**
 * Registry of all available stat block systems
 */
export const SYSTEM_REGISTRY: SystemRegistry = {
  "dnd5e-2014": dnd5e2014System,
  "dnd5e-2024": dnd5e2024System,
};

/**
 * Get a system by ID
 */
export function getSystem(systemId: string) {
  return SYSTEM_REGISTRY[systemId];
}

/**
 * Get all available systems as an array
 */
export function getAllSystems() {
  return Object.values(SYSTEM_REGISTRY);
}

/**
 * Get system metadata for all systems
 */
export function getAllSystemMetadata() {
  return getAllSystems().map(system => system.schema.metadata);
}

/**
 * Transform data from one system to another
 */
export function transformBetweenSystems(
  sourceSystemId: string,
  targetSystemId: string,
  sourceData: any
): any | null {
  const targetSystem = getSystem(targetSystemId);
  
  if (!targetSystem?.schema.transformFrom) {
    return null;
  }
  
  return targetSystem.schema.transformFrom(sourceSystemId, sourceData);
}

/**
 * Check if a transformation is available between two systems
 */
export function canTransform(sourceSystemId: string, targetSystemId: string): boolean {
  const targetSystem = getSystem(targetSystemId);
  return !!targetSystem?.schema.transformFrom;
}

/**
 * Default system ID
 */
export const DEFAULT_SYSTEM_ID = "dnd5e-2024";
