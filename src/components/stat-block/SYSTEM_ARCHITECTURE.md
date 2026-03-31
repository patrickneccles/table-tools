# Stat Block System Architecture

This document describes the new multi-system architecture for the Stat Block Generator, which now supports multiple TTRPG systems and editions.

## Overview

The Stat Block Generator has been evolved from a single D&D 5e 2014 implementation to a flexible, extensible system that can support multiple TTRPG systems and editions. This allows users to:

- Switch between different stat block formats (e.g., D&D 5e 2014 vs 2024)
- Transform stat blocks between compatible systems
- Add new systems easily without modifying existing code

## Architecture

### Core Concepts

1. **System** - A complete stat block implementation including data schema and renderer
2. **Registry** - Central catalog of all available systems
3. **Transformer** - Functions to convert data between systems
4. **Renderer** - React component that displays a stat block in a specific format

### Directory Structure

```
src/components/stat-block/
├── systems/
│   ├── base-system.ts          # Core interfaces and types
│   ├── registry.ts              # System registry and utilities
│   ├── index.ts                 # Exports for systems
│   ├── dnd5e-2014/
│   │   ├── types.ts             # 2014 data types
│   │   ├── renderer.tsx         # 2014 visual renderer
│   │   ├── system.ts            # 2014 system definition
│   │   └── index.ts             # 2014 exports
│   └── dnd5e-2024/
│       ├── types.ts             # 2024 data types
│       ├── renderer.tsx         # 2024 visual renderer
│       ├── system.ts            # 2024 system definition
│       └── index.ts             # 2024 exports
├── system-stat-block-view.tsx   # System-agnostic renderer
├── system-selector.tsx          # UI for switching systems
└── [existing files...]          # Backwards compatibility
```

## Currently Supported Systems

### D&D 5e (2014)
- Classic 2014 Monster Manual format
- Standard ability score grid
- Traditional layout

### D&D 5e (2024)
- Updated 2024 Core Rules format
- **New**: Explicit Initiative display
- **New**: Gear section for retrievable equipment
- **New**: Proficiency Bonus in CR line
- **Updated**: Two-column ability score table with saves
- **Updated**: Separate Resistances and Immunities

## Key Differences Between 2014 and 2024

| Feature | 2014 Edition | 2024 Edition |
|---------|-------------|-------------|
| **Initiative** | Not shown | **Initiative +5 (15)** |
| **Ability Scores** | Single 6-column grid | Two 3-row tables with saves |
| **Gear** | Not present | **Gear** line for retrievable items |
| **Challenge Rating** | **CR 3 (700 XP)** | **CR 3 (XP 700; PB +2)** |
| **Resistances** | Combined with immunities | Separate **Resistances** line |
| **Immunities** | Separate damage/condition | Combined **Immunities** line |

## Usage Examples

### Basic Rendering

```typescript
import { SystemStatBlockView } from "@/components/stat-block";

function MyComponent() {
  const statBlockData = { /* ... */ };
  
  return (
    <SystemStatBlockView
      systemId="dnd5e-2024"
      data={statBlockData}
    />
  );
}
```

### System Selection

```typescript
import { SystemSelector } from "@/components/stat-block";

function Editor() {
  const [currentSystem, setCurrentSystem] = useState("dnd5e-2024");
  
  return (
    <SystemSelector
      currentSystemId={currentSystem}
      onSystemChange={setCurrentSystem}
    />
  );
}
```

### System Transformation

```typescript
import { transformBetweenSystems } from "@/components/stat-block";

// Convert 2014 data to 2024 format
const data2014 = { /* 2014 stat block */ };
const data2024 = transformBetweenSystems("dnd5e-2014", "dnd5e-2024", data2014);
```

## Adding a New System

To add support for a new TTRPG system:

### 1. Create System Directory

```
src/components/stat-block/systems/your-system/
├── types.ts       # Data types for your system
├── renderer.tsx   # Visual renderer component
├── system.ts      # System definition
└── index.ts       # Exports
```

### 2. Define Types

```typescript
// types.ts
export type YourSystemData = {
  name: string;
  // ... your fields
};

export function yourCalculation(value: number): number {
  // ... your logic
}
```

### 3. Create Renderer

```typescript
// renderer.tsx
import type { YourSystemData } from "./types";

export function YourSystemRenderer({ data }: { data: YourSystemData }) {
  return (
    <div className="your-styling">
      {/* Render your stat block */}
    </div>
  );
}
```

### 4. Define System

```typescript
// system.ts
import type { StatBlockSystem } from "../base-system";
import type { YourSystemData } from "./types";
import { YourSystemRenderer } from "./renderer";

export const yourSystem: StatBlockSystem<YourSystemData> = {
  schema: {
    metadata: {
      id: "your-system-id",
      name: "Your System Name",
      description: "Brief description",
      version: "1.0",
    },
    defaultData: {
      // Default empty stat block
    },
    sections: [
      // Editor field definitions
    ],
    transformFrom: (sourceSystem, sourceData) => {
      // Optional: conversion logic
    },
  },
  Renderer: YourSystemRenderer,
};
```

### 5. Register System

```typescript
// systems/registry.ts
import { yourSystem } from "./your-system/system";

export const SYSTEM_REGISTRY: SystemRegistry = {
  "dnd5e-2014": dnd5e2014System,
  "dnd5e-2024": dnd5e2024System,
  "your-system-id": yourSystem,  // Add here
};
```

## API Reference

### Core Functions

#### `getSystem(systemId: string)`
Get a system definition by ID.

#### `getAllSystems()`
Get all registered systems.

#### `getAllSystemMetadata()`
Get metadata for all systems (useful for UI lists).

#### `transformBetweenSystems(sourceSystemId, targetSystemId, sourceData)`
Convert data from one system to another.

#### `canTransform(sourceSystemId, targetSystemId)`
Check if transformation is available.

### Components

#### `SystemStatBlockView`
System-agnostic renderer that automatically uses the correct renderer.

**Props:**
- `systemId: string` - System identifier
- `data: any` - Stat block data
- `className?: string` - Additional CSS classes

#### `SystemSelector`
UI component for switching between systems.

**Props:**
- `currentSystemId: string` - Currently selected system
- `onSystemChange: (systemId: string) => void` - Change handler
- `isLightMode?: boolean` - Theme flag
- `sourceSystemId?: string` - For showing conversion availability

## Backwards Compatibility

All existing code continues to work without modification:

```typescript
// Legacy import still works
import { StatBlockView } from "@/components/stat-block";

// Legacy types still available
import type { StatBlockData } from "@/components/stat-block";
```

The legacy `StatBlockView` component now uses the 2014 system internally.

## Future Enhancements

Potential additions to the system:

1. **More Systems**
   - Pathfinder 2e
   - Call of Cthulhu
   - Savage Worlds
   - Custom/homebrew systems

2. **Advanced Transformations**
   - Lossy transformations with warnings
   - Manual field mapping UI
   - Conversion history

3. **System Extensions**
   - Custom field validators
   - Auto-calculation rules
   - Template libraries per system

4. **Import/Export**
   - System-specific file formats
   - Cross-system compatibility checks
   - Batch conversion tools

## References

- [D&D Beyond 2024 Stat Blocks](https://www.dndbeyond.com/sources/dnd/br-2024/how-to-use-a-monster)
- 2014 Monster Manual (Wizards of the Coast)
- System Reference Document (SRD 5.1)

## Contributing

When adding a new system:

1. Follow the directory structure pattern
2. Include complete TypeScript types
3. Add tests for transformations
4. Update this documentation
5. Add example templates

## License

Part of the Moodie project. See project LICENSE for details.
