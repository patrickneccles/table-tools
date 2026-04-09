# Stat Block System Architecture

## Overview

The Stat Block Generator supports multiple TTRPG systems through a registry-based architecture. Each system is a self-contained module that defines its own data schema, editor fields, and visual renderer. Adding a new system doesn't require touching existing code.

## Currently Supported Systems

| System ID    | Name           | Notes                                                                                              |
| ------------ | -------------- | -------------------------------------------------------------------------------------------------- |
| `dnd5e-2024` | D&D 5e (2024)  | Default system                                                                                     |
| `dnd5e-2014` | D&D 5e (2014)  | Classic Monster Manual format                                                                      |
| `shadowdark` | Shadowdark RPG | Compact format; displays ability modifiers directly (not raw scores); single-line core stats block |

## Directory Structure

```
src/components/stat-block/
├── systems/
│   ├── base-system.ts          # Core interfaces and types
│   ├── registry.ts             # System registry and utility functions
│   ├── index.ts                # Exports
│   ├── dnd5e-2014/
│   │   ├── types.ts
│   │   ├── renderer.tsx
│   │   ├── system.ts
│   │   └── index.ts
│   ├── dnd5e-2024/
│   │   ├── types.ts
│   │   ├── renderer.tsx
│   │   ├── system.ts
│   │   └── index.ts
│   └── shadowdark/
│       ├── types.ts
│       ├── renderer.tsx
│       ├── system.ts
│       └── index.ts
├── system-stat-block-view.tsx  # System-agnostic renderer wrapper
├── system-selector.tsx         # UI for switching systems
├── stat-block-editor.tsx
├── dynamic-editor.tsx          # Schema-driven form editor
└── [supporting files]
```

## Core Concepts

- **System** — a complete stat block implementation: data schema, editor field definitions, and a renderer
- **Registry** — `systems/registry.ts` is the single source of truth for all available systems
- **Renderer** — React component that displays a stat block in a system-specific visual format
- **DynamicEditor** — schema-driven form; field UI is generated from the `sections[]` array in each system definition

When switching systems, data is kept as-is and the new renderer works with what it has. There is no cross-system data transformation — it was removed as too cumbersome to maintain across an expanding set of systems.

## Adding a New System

### 1. Create the system directory

```
src/components/stat-block/systems/<your-system-id>/
├── types.ts       # Data types for your system
├── renderer.tsx   # Visual renderer component
├── system.ts      # System definition (schema + Renderer)
└── index.ts       # Exports
```

### 2. Define types (`types.ts`)

```typescript
export type YourSystemData = {
  name: string;
  // ... your fields
};
```

### 3. Create a renderer (`renderer.tsx`)

```typescript
import type { YourSystemData } from "./types";

export function YourSystemRenderer({ data }: { data: YourSystemData }) {
  return (
    <div className="...">
      {/* render the stat block */}
    </div>
  );
}
```

### 4. Define the system (`system.ts`)

```typescript
import type { StatBlockSystem } from '../base-system';
import type { YourSystemData } from './types';
import { YourSystemRenderer } from './renderer';

export const yourSystem: StatBlockSystem<YourSystemData> = {
  schema: {
    metadata: {
      id: 'your-system-id',
      name: 'Your System Name',
      description: 'Brief description',
      version: '1.0',
    },
    defaultData: {
      // empty/default stat block
    },
    sections: [
      // editor field definitions
    ],
  },
  Renderer: YourSystemRenderer,
};
```

### 5. Register the system (`systems/registry.ts`)

```typescript
import { yourSystem } from './your-system/system';

export const SYSTEM_REGISTRY: SystemRegistry = {
  'dnd5e-2014': dnd5e2014System,
  'dnd5e-2024': dnd5e2024System,
  shadowdark: shadowdarkSystem,
  'your-system-id': yourSystem, // add here
};
```

The system will appear automatically in the selector UI.

## API Reference

### Registry functions (`systems/registry.ts`)

| Function                 | Description                         |
| ------------------------ | ----------------------------------- |
| `getSystem(id)`          | Get a system definition by ID       |
| `getAllSystems()`        | All registered systems as an array  |
| `getAllSystemMetadata()` | Metadata only (useful for UI lists) |

### Components

**`SystemStatBlockView`** — renders a stat block using the correct system renderer

```tsx
<SystemStatBlockView systemId="shadowdark" data={statBlockData} />
```

**`SystemSelector`** — UI dropdown for switching systems

```tsx
<SystemSelector
  currentSystemId={currentSystem}
  onSystemChange={setCurrentSystem}
  isLightMode={isLightMode}
/>
```

## Backwards Compatibility

Legacy imports still work — `StatBlockView` and `StatBlockData` are re-exported aliases that use the 2014 system internally.

## Planned Additions

1. **Spell Block Editor** — parallel system to stat blocks; will follow this same architecture
2. **More TTRPG systems** — Pathfinder 2e, Call of Cthulhu, custom/homebrew
3. **System-specific validation** — field validators, auto-calculation rules
4. **System-specific export formats**
