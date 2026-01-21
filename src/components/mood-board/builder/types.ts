import { LucideIcon } from "lucide-react";
import { MoodTheme } from "../types";

/**
 * A sound definition in the registry (template for creating board sounds)
 */
export type SoundDefinition = {
  id: string;
  name: string;
  audioSrc: string;
  icon: LucideIcon;
  category: "ambience" | "effect";
  tags?: string[]; // For future filtering/search
};

/**
 * A sound placed on a board slot
 */
export type PlacedSound = {
  definitionId: string;
  slotIndex: number;
};

/**
 * Board configuration that can be saved/loaded
 */
export type BoardConfig = {
  id: string;
  name: string;
  description?: string;
  theme: MoodTheme;
  ambienceSlots: (string | null)[]; // Array of sound definition IDs or null for empty
  effectSlots: (string | null)[]; // Array of sound definition IDs or null for empty
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Builder state for the UI
 */
export type BuilderState = {
  config: BoardConfig;
  isDirty: boolean; // Has unsaved changes
  selectedSlot: { type: "ambience" | "effect"; index: number } | null;
};

/**
 * Default theme for new boards
 */
export const DEFAULT_THEME: MoodTheme = {
  primary: "#3b82f6",
  secondary: "#60a5fa",
  primaryForeground: "#ffffff",
};

/**
 * Default board configuration (uses effect-heavy layout: 4 ambience + 8 effects)
 */
export const createDefaultBoardConfig = (slotConfig?: SlotConfig): BoardConfig => ({
  id: crypto.randomUUID(),
  name: "New Mood Board",
  description: "",
  theme: { ...DEFAULT_THEME },
  ambienceSlots: Array(slotConfig?.ambienceCount ?? 4).fill(null),
  effectSlots: Array(slotConfig?.effectCount ?? 8).fill(null),
});

/**
 * Slot configuration for extensibility
 */
export type SlotConfig = {
  ambienceCount: number;
  effectCount: number;
  ambienceColumns: number;
  effectColumns: number;
  squareEffects?: boolean; // When true, effects use large square buttons
  rectangularAmbience?: boolean; // When true, ambience uses short rectangular buttons
  effectsFirst?: boolean; // When true, effects section appears above ambience
};

/**
 * Layout presets for different use cases
 */
export type LayoutPreset = {
  id: string;
  name: string;
  description: string;
  config: SlotConfig;
};

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: "effect-heavy",
    name: "Effect Heavy (4+8)",
    description: "4 ambience, 8 effects - ideal for TTRPGs & streaming",
    config: {
      ambienceCount: 4,
      effectCount: 8,
      ambienceColumns: 4,
      effectColumns: 4,
      squareEffects: true, // Effects are the focus - large square buttons
      rectangularAmbience: true, // Ambience as compact row
      effectsFirst: true, // Effects appear at the top
    },
  },
  {
    id: "ambience-heavy",
    name: "Ambience Heavy (8+4)",
    description: "8 ambience, 4 effects - for layered soundscapes",
    config: {
      ambienceCount: 8,
      effectCount: 4,
      ambienceColumns: 4,
      effectColumns: 4,
    },
  },
  {
    id: "compact",
    name: "Compact (4+4)",
    description: "4 ambience, 4 effects - large square buttons",
    config: {
      ambienceCount: 4,
      effectCount: 4,
      ambienceColumns: 4,
      effectColumns: 4,
      squareEffects: true, // Both rows use large square buttons
    },
  },
];

// Default is now effect-heavy (4 ambience + 8 effects)
export const DEFAULT_SLOT_CONFIG: SlotConfig = LAYOUT_PRESETS[0].config;
