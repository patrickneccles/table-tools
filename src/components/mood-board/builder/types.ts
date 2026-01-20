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
 * Default board configuration
 */
export const createDefaultBoardConfig = (): BoardConfig => ({
  id: crypto.randomUUID(),
  name: "New Mood Board",
  description: "",
  theme: { ...DEFAULT_THEME },
  ambienceSlots: Array(8).fill(null),
  effectSlots: Array(4).fill(null),
});

/**
 * Slot configuration for extensibility
 */
export type SlotConfig = {
  ambienceCount: number;
  effectCount: number;
  ambienceColumns: number;
  effectColumns: number;
};

export const DEFAULT_SLOT_CONFIG: SlotConfig = {
  ambienceCount: 8,
  effectCount: 4,
  ambienceColumns: 4,
  effectColumns: 4,
};
