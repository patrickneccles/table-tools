# Migration Guide: Multi-System Stat Block Generator

## What Changed?

The Stat Block Generator has been evolved to support multiple TTRPG systems and editions. **Your existing code still works!** This is a non-breaking change that adds new capabilities.

## ✅ What's New

### 1. Two D&D 5e Editions
- **D&D 5e (2014)** - Classic Monster Manual format
- **D&D 5e (2024)** - Updated Core Rules with Initiative, Gear, and PB

### 2. System Selector Component
```tsx
<SystemSelector
  currentSystemId="dnd5e-2024"
  onSystemChange={setSystemId}
/>
```

### 3. Universal Stat Block Renderer
```tsx
<SystemStatBlockView
  systemId="dnd5e-2024"
  data={statBlockData}
/>
```

### 4. System Transformations
```tsx
const data2024 = transformBetweenSystems("dnd5e-2014", "dnd5e-2024", data2014);
```

## 🔄 Migration Steps (Optional)

Your existing code works as-is, but you can opt-in to the new features:

### Option 1: Keep Everything As-Is (Easiest)
Do nothing! Your existing `StatBlockView` component continues to work.

### Option 2: Add System Selection (Recommended)
Update your stat block page to allow users to switch between editions:

```tsx
// Add to your page component
const [systemId, setSystemId] = useState("dnd5e-2024");

// Add SystemSelector to your UI
<SystemSelector
  currentSystemId={systemId}
  onSystemChange={setSystemId}
  isLightMode={isLightMode}
/>

// Replace StatBlockView with SystemStatBlockView
<SystemStatBlockView
  systemId={systemId}
  data={statBlock}
/>
```

### Option 3: Full Multi-System Support (Advanced)
Maintain separate data for each system and allow seamless conversion. See `INTEGRATION_EXAMPLE.tsx` for complete examples.

## 📝 Key Files Created

### Core System Files
- `systems/base-system.ts` - Type definitions and interfaces
- `systems/registry.ts` - Central registry of all systems
- `systems/index.ts` - Exports

### D&D 5e 2014 Edition
- `systems/dnd5e-2014/types.ts`
- `systems/dnd5e-2014/renderer.tsx`
- `systems/dnd5e-2014/system.ts`

### D&D 5e 2024 Edition
- `systems/dnd5e-2024/types.ts`
- `systems/dnd5e-2024/renderer.tsx`
- `systems/dnd5e-2024/system.ts`

### Components
- `system-stat-block-view.tsx` - Universal renderer
- `system-selector.tsx` - System switcher UI

### Documentation
- `SYSTEM_ARCHITECTURE.md` - Complete architecture docs
- `INTEGRATION_EXAMPLE.tsx` - Code examples
- `MIGRATION_GUIDE.md` - This file

## 🎯 Quick Start: Adding to Stat Blocks Page

Here's the minimal change to add system selection:

```tsx
// At the top of your page
import { 
  SystemSelector, 
  SystemStatBlockView,
  DEFAULT_SYSTEM_ID, // "dnd5e-2024"
} from "@/components/stat-block";

// In your component
const [systemId, setSystemId] = useState(DEFAULT_SYSTEM_ID);

// In your header/toolbar
<SystemSelector
  currentSystemId={systemId}
  onSystemChange={setSystemId}
  isLightMode={isLightMode}
/>

// In your preview area (replace StatBlockView)
<SystemStatBlockView
  systemId={systemId}
  data={statBlock}
/>
```

## 🔍 Key Differences: 2014 vs 2024

### Visual Changes
1. **Initiative** - 2024 shows explicit initiative modifier and score
2. **Ability Scores** - 2024 uses two-column table format with saves
3. **Gear** - 2024 has dedicated gear section
4. **Challenge Rating** - 2024 includes Proficiency Bonus (PB)

### Data Structure
```typescript
// 2024 adds these fields:
{
  initiative?: number,
  proficiencyBonus?: number,
  gear?: string[],
  // Resistances/Immunities reorganized
  resistances?: string,
  vulnerabilities?: string,
  immunities?: string, // combines damage + conditions
}
```

## 🚀 Future: Adding More Systems

Want to add Pathfinder, Call of Cthulhu, or a custom system? The architecture is ready! See `SYSTEM_ARCHITECTURE.md` for complete instructions.

Basic steps:
1. Create `systems/your-system/` directory
2. Define types, renderer, and system definition
3. Register in `systems/registry.ts`
4. Done! System appears in selector automatically

## 📚 Additional Resources

- **Architecture**: `SYSTEM_ARCHITECTURE.md`
- **Examples**: `INTEGRATION_EXAMPLE.tsx`
- **D&D 2024 Reference**: https://www.dndbeyond.com/sources/dnd/br-2024/how-to-use-a-monster

## ❓ FAQ

### Will my existing stat blocks break?
No! The `StatBlockView` component still works exactly as before.

### Do I need to convert my data?
No! Your existing `StatBlockData` types are now aliased to `DnD5e2014Data`. Everything is backwards compatible.

### How do I convert between editions?
```tsx
import { transformBetweenSystems } from "@/components/stat-block";

const data2024 = transformBetweenSystems(
  "dnd5e-2014", 
  "dnd5e-2024", 
  oldData
);
```

### Can I add my own systems?
Yes! Follow the guide in `SYSTEM_ARCHITECTURE.md`. The architecture supports any TTRPG system.

### What if I only want to use 2024?
Set the default:
```tsx
const [systemId] = useState("dnd5e-2024");
```

### Do templates work with both systems?
The existing templates are 2014 format. You can:
1. Keep them as-is (they work!)
2. Transform them to 2024 on load
3. Create new 2024-specific templates

## 🎉 Benefits

1. **Future-Proof** - Easy to add new systems
2. **User Choice** - Players can pick their preferred edition
3. **No Breaking Changes** - Existing code works
4. **Type-Safe** - Full TypeScript support
5. **Extensible** - Clean architecture for additions

## 📞 Need Help?

- Check `INTEGRATION_EXAMPLE.tsx` for code examples
- See `SYSTEM_ARCHITECTURE.md` for deep dive
- Review the component files for implementation details
