# Table Tools — CLAUDE.md

## What This Project Is

Table Tools is a TTRPG toolkit web app — a growing collection of tools for tabletop players, GMs, and streamers. Current tools:

- **Mood Board** — Web Audio API soundboard with looping ambience, one-shot effects, ducking, presets, and a drag-and-drop board builder
- **Stat Block Generator** — Multi-system (D&D 5e 2014/2024, Shadowdark) stat block editor with live preview, undo/redo, and import/export
- **Hex Map** — Hex grid canvas painter with stamps, flood fill, text labels, undo/redo, and import/export
- **Spell Block Generator** — Multi-system spell block editor (D&D 5e 2024 so far) with live preview, SRD templates, undo/redo, and import/export

New tools will be added over time. Each tool gets its own route under `src/app/` and its own component directory under `src/components/`.

## Long-Term Direction

- **Hosted & potentially open-source** — targeting Vercel deployment; open-source is on the table
- **Offline-first** — PWA foundation is already in place (service worker, manifest); tools should work fully offline
- **Local file storage** — users should be able to save/load files locally (IndexedDB or File System Access API)
- **Connected accounts (PaaS)** — longer-term: cloud storage for authenticated users to persist and share their work across devices

## Stack

- **Next.js 16** + **React 19** + **TypeScript 5** (strict mode)
- **Tailwind CSS 4** + **shadcn/ui** (new-york style) — the primary UI layer
- **@dnd-kit** for drag-and-drop
- **Lucide React** for all icons
- **Web Audio API** for mood board (custom manager, no library)
- **Vitest** — unit test framework (Node 22 required; see `.nvmrc`)

## Dev Commands

```bash
npm run dev        # Dev server at http://localhost:3000
npm run build      # Production build
npm run lint       # ESLint check
npm run test       # Run tests once
npm run test:watch # Run tests in watch mode
```

Git commits automatically run prettier + eslint --fix via lint-staged (pre-commit hook).

**Node version**: use v22 (see `.nvmrc`). If you switch Node versions, reinstall `node_modules`.

## Code Conventions

### Server vs Client Components

- Prefer React Server Components for static/data-fetching work
- Most feature components are interactive and should be `'use client'`
- Don't add unnecessary server round-trips — keep dynamic UI fully client-side

### UI Components

- **Always reach for shadcn/ui first** for common primitives: dialogs, dropdowns, buttons, sliders, tabs, inputs, etc.
- Write custom React + Tailwind components only for feature-specific UI that shadcn/ui doesn't cover
- Use `cn()` (from `src/lib/utils.ts`) for all dynamic `className` composition
- Icons: **Lucide React only** — no other icon libraries

### State Management

- **React Context** for feature-scoped UI state (brush tool, audio presets, grid settings)
- **localStorage** for persistence — debounce writes, don't thrash
- **Zustand** when state complexity justifies it — don't add it preemptively
- **`useHistory`** (`src/hooks/use-history.ts`) for undo/redo — use this pattern, don't reinvent it

### TypeScript

- Strict mode — avoid `any`; if you must use it, leave a comment explaining why
- Co-locate types with the feature (`systems/dnd5e-2024/types.ts`, not a global types file)
- No barrel re-exports just for the sake of it — import from the source

### Files & Organization

- Feature components: `src/components/<feature>/`
- Page routes: `src/app/<feature>/page.tsx`
- shadcn/ui primitives: `src/components/ui/` — these are managed by the shadcn CLI, avoid hand-editing them

## Feature Architecture

### Mood Board

- **`src/lib/audio-manager.ts`** — all audio runs through here (Web Audio API: GainNodes, BiquadFilters, ConvolverNode for reverb). It's large but cohesive — refactor freely if needed, just preserve the public API shape
- Two layers: **ambience** (looping background) and **effects** (one-shot triggers)
- Ducking: effects lower ambience volume automatically via GainNode automation
- Audio files live in `public/audio/` — currently being migrated to open-source alternatives
- Board builder uses `@dnd-kit` for drag-and-drop slot assignment

### Stat Block Generator

- Multi-system architecture — each TTRPG system is a self-contained module under `systems/<id>/`
- **Read `src/components/stat-block/SYSTEM_ARCHITECTURE.md` before making changes here**
- To add a new system: create `systems/<id>/` with `types.ts`, `renderer.tsx`, `system.ts`, `index.ts`, then register in `systems/registry.ts`
- `DynamicEditor` is schema-driven — field UI is defined by the `sections[]` array in each system definition
- Legacy `StatBlockView` export still works — it wraps the 2014 system internally

### Hex Map

- State is split: `BrushContext` (active tool/color) + `SettingsContext` (grid dimensions/style)
- Supports flat-top and pointy-top hex orientations
- Tools: paint, flood fill, stamp placement, text labels (inline SVG `<foreignObject>` editor)
- Undo/redo via `useHistory` hook

### Spell Block Generator

- Parallel architecture to Stat Block Generator — same `StatBlockSystem<T>`, `DynamicEditor`, and file-system patterns
- System modules live under `src/components/spell-block/systems/<id>/`
- Templates live under `src/components/spell-block/templates/<system-id>/` as JSON files, loaded via `require.context`
- `SpellTemplateSelector` mirrors `TemplateSelector` from stat blocks
- To add a new system: follow the same pattern as `dnd5e-2024` — `types.ts`, `renderer.tsx`, `system.ts`, `index.ts`, register in `systems/registry.ts`

## Active Work Areas

1. **Mood Board** — replacing `public/audio/` files with open-source audio; fixing broken playback
2. **Hex Map** — visual polish and UX refinement pass
3. **Spell Block Generator** — renderer polish pass; additional TTRPG systems beyond D&D 5e 2024

## File Persistence

`src/lib/file-system.ts` is the canonical module for file save/load. All tool data is wrapped in a `TableToolsFile<T>` envelope before download/upload:

```typescript
{ id, version, type, name, createdAt, updatedAt, data: T }
```

- `createFile` / `updateFile` / `renameFile` — pure constructors, always return new objects
- `downloadFile` — triggers a browser file download (side effect, not unit-tested)
- `uploadFile` — opens a file picker and parses the result (side effect, not unit-tested)
- `parseFileJSON` — pure parser/validator; this is what gets unit-tested

**Two persistence layers coexist:**

- `localStorage` — auto-saves current in-progress work (session recovery on page refresh, already in stat blocks)
- `file-system.ts` — intentional user-initiated save/load to the local filesystem

## Testing

Tests live alongside their source in `__tests__/` subdirectories. Run with `npm test`.
Coverage targets: pure functions and business logic only — no component rendering, no DOM-dependent code.

## Docs

- `src/components/stat-block/SYSTEM_ARCHITECTURE.md` — canonical design reference for the stat block system; keep it up to date when making structural changes
