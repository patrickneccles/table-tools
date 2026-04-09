/**
 * Base System Interface
 *
 * Defines the contract that all stat block systems must implement.
 * This allows for easy addition of new TTRPG systems in the future.
 */

import type { ComponentType } from 'react';

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
  type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'multiselect';
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
export type SystemSchema<T = unknown> = {
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
};

/**
 * Renderer component props
 */
export type SystemRendererProps<T = unknown> = {
  data: T;
  className?: string;
};

/**
 * Complete system definition
 */
export type StatBlockSystem<T = unknown> = {
  schema: SystemSchema<T>;
  /** React component for rendering the stat block */
  Renderer: ComponentType<SystemRendererProps<T>>;
  /** Optional custom editor component (falls back to generic editor) */
  Editor?: ComponentType<SystemRendererProps<T>>;
};

/**
 * Type-safe system registry
 */
export type SystemRegistry = {
  // Heterogeneous systems per key; `any` is the practical erased row type here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [systemId: string]: StatBlockSystem<any>;
};
