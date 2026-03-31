/**
 * Base System Interface
 * 
 * Defines the contract that all stat block systems must implement.
 * This allows for easy addition of new TTRPG systems in the future.
 */

import type { ReactNode } from "react";

/**
 * Metadata about a stat block system
 */
export type SystemMetadata = {
  /** Unique identifier for the system */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Release year or version */
  version: string;
};

/**
 * Field definition for the editor
 */
export type FieldDefinition = {
  /** Field key in the data object */
  key: string;
  /** Display label */
  label: string;
  /** Field type */
  type: "text" | "number" | "textarea" | "select" | "checkbox" | "multiselect";
  /** Placeholder text (for text/textarea) */
  placeholder?: string;
  /** Options (for select/multiselect) */
  options?: Array<{ value: string; label: string }>;
  /** Validation rules */
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
  /** Help text */
  helpText?: string;
  /** Whether this field should be displayed */
  visible?: boolean;
};

/**
 * Section definition for organizing fields
 */
export type SectionDefinition = {
  /** Section key */
  key: string;
  /** Section title */
  title: string;
  /** Fields in this section */
  fields: FieldDefinition[];
  /** Whether section starts collapsed */
  defaultCollapsed?: boolean;
};

/**
 * Schema definition for a stat block system
 */
export type SystemSchema<T = any> = {
  /** Metadata about the system */
  metadata: SystemMetadata;
  /** Default empty stat block */
  defaultData: T;
  /** Editor sections and fields */
  sections: SectionDefinition[];
  /** Trait-like sections that this system uses (e.g., ["traits", "actions"], or ["features"]) */
  traitSections?: string[];
  /** Validation function for the entire stat block */
  validate?: (data: T) => { valid: boolean; errors?: string[] };
  /** Transform function to convert from another system (if applicable) */
  transformFrom?: (sourceSystem: string, sourceData: any) => T | null;
};

/**
 * Renderer component props
 */
export type SystemRendererProps<T = any> = {
  data: T;
  className?: string;
};

/**
 * Complete system definition
 */
export type StatBlockSystem<T = any> = {
  schema: SystemSchema<T>;
  /** React component for rendering the stat block */
  Renderer: React.ComponentType<SystemRendererProps<T>>;
  /** Optional custom editor component (falls back to generic editor) */
  Editor?: React.ComponentType<any>;
};

/**
 * Type-safe system registry
 */
export type SystemRegistry = {
  [systemId: string]: StatBlockSystem<any>;
};
