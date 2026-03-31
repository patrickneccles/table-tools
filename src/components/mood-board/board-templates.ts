/**
 * Pre-made board templates for common scenarios
 * Each template defines a mood with sounds from the sample-moods registry
 */

import { Mood, MoodTheme } from "./types";
import {
  Bird,
  Bug,
  CloudRain,
  Wind,
  Waves,
  Flame,
  Footprints,
  Zap,
  Volume2,
  Dog,
  Store,
  Beer,
  Hammer,
  Bell,
  Church,
  Swords,
  Ship,
  Anchor,
  Snowflake,
  Skull,
  Ghost,
  Sparkles,
  Mountain,
  Moon,
  Sun,
  Droplets,
  TreePine,
  ChessKnight,
} from "lucide-react";

// Template categories for organization
export type TemplateCategory = "fantasy" | "nature" | "urban" | "horror" | "adventure";

export type BoardTemplate = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  mood: Mood;
};

// ============================================
// FANTASY TEMPLATES
// ============================================

const tavernTemplate: BoardTemplate = {
  id: "tavern",
  name: "Tavern",
  description: "Bustling inn with drinks, music, and rowdy patrons",
  category: "fantasy",
  mood: {
    id: "tavern",
    name: "Tavern",
    description: "A lively tavern filled with music, laughter, and clinking mugs",
    theme: {
      primary: "#b45309",
      secondary: "#fbbf24",
      primaryForeground: "#ffffff",
    },
    ambience: [
      { id: "tavern-crowd", name: "Crowd", audioSrc: "/audio/ambience-tavern.mp3", icon: Beer },
      { id: "tavern-fire", name: "Fireplace", audioSrc: "/audio/ambience-campfire.mp3", icon: Flame },
      { id: "tavern-rain", name: "Rain Outside", audioSrc: "/audio/ambience-rain.mp3", icon: CloudRain },
      { id: "tavern-music", name: "Bard Music", audioSrc: "/audio/ambience-tavern.mp3", icon: Volume2 },
    ],
    effects: [
      { id: "tavern-cheer", name: "Cheering", audioSrc: "/audio/sfx-cheer.mp3", icon: Beer },
      { id: "tavern-door", name: "Door Open", audioSrc: "/audio/sfx-door.mp3", icon: Store },
      { id: "tavern-glass", name: "Glass Clink", audioSrc: "/audio/sfx-glass.mp3", icon: Beer },
      { id: "tavern-fight", name: "Bar Fight", audioSrc: "/audio/sfx-combat.mp3", icon: Swords },
      { id: "tavern-laugh", name: "Laughter", audioSrc: "/audio/sfx-laugh.mp3", icon: Volume2 },
      { id: "tavern-bell", name: "Bell Ring", audioSrc: "/audio/sfx-bell.mp3", icon: Bell },
      { id: "tavern-steps", name: "Footprints", audioSrc: "/audio/sfx-footsteps.mp3", icon: Footprints },
      { id: "tavern-thunder", name: "Thunder", audioSrc: "/audio/sfx-thunder.mp3", icon: Zap },
    ],
  },
};

const combatTemplate: BoardTemplate = {
  id: "combat",
  name: "Battle",
  description: "Intense combat with clashing steel and war cries",
  category: "fantasy",
  mood: {
    id: "combat",
    name: "Battle",
    description: "The chaos of combat with swords, shields, and magic",
    theme: {
      primary: "#dc2626",
      secondary: "#f87171",
      primaryForeground: "#ffffff",
    },
    ambience: [
      { id: "combat-battle", name: "Distant Battle", audioSrc: "/audio/ambience-battle.mp3", icon: Swords },
      { id: "combat-wind", name: "Wind", audioSrc: "/audio/ambience-wind.mp3", icon: Wind },
      { id: "combat-fire", name: "Fires", audioSrc: "/audio/ambience-campfire.mp3", icon: Flame },
      { id: "combat-march", name: "Marching", audioSrc: "/audio/ambience-march.mp3", icon: Footprints },
    ],
    effects: [
      { id: "combat-sword", name: "Sword Clash", audioSrc: "/audio/sfx-sword.mp3", icon: Swords },
      { id: "combat-arrow", name: "Arrow", audioSrc: "/audio/sfx-arrow.mp3", icon: Zap },
      { id: "combat-spell", name: "Magic Spell", audioSrc: "/audio/sfx-magic.mp3", icon: Sparkles },
      { id: "combat-roar", name: "War Cry", audioSrc: "/audio/sfx-roar.mp3", icon: Volume2 },
      { id: "combat-shield", name: "Shield Block", audioSrc: "/audio/sfx-shield.mp3", icon: Swords },
      { id: "combat-death", name: "Death Cry", audioSrc: "/audio/sfx-death.mp3", icon: Skull },
      { id: "combat-horse", name: "Cavalry", audioSrc: "/audio/sfx-gallop.mp3", icon: ChessKnight },
      { id: "combat-horn", name: "War Horn", audioSrc: "/audio/sfx-horn.mp3", icon: Volume2 },
    ],
  },
};

const dungeonTemplate: BoardTemplate = {
  id: "dungeon",
  name: "Dungeon",
  description: "Dark underground with dripping water and distant echoes",
  category: "fantasy",
  mood: {
    id: "dungeon",
    name: "Dungeon",
    description: "A foreboding underground labyrinth",
    theme: {
      primary: "#4b5563",
      secondary: "#9ca3af",
      primaryForeground: "#ffffff",
    },
    ambience: [
      { id: "dungeon-drip", name: "Dripping", audioSrc: "/audio/ambience-cave.mp3", icon: Droplets },
      { id: "dungeon-wind", name: "Draft", audioSrc: "/audio/ambience-wind.mp3", icon: Wind },
      { id: "dungeon-echo", name: "Echoes", audioSrc: "/audio/ambience-cave.mp3", icon: Volume2 },
      { id: "dungeon-torch", name: "Torches", audioSrc: "/audio/ambience-campfire.mp3", icon: Flame },
    ],
    effects: [
      { id: "dungeon-door", name: "Stone Door", audioSrc: "/audio/sfx-stone.mp3", icon: Mountain },
      { id: "dungeon-chain", name: "Chains", audioSrc: "/audio/sfx-chains.mp3", icon: Volume2 },
      { id: "dungeon-growl", name: "Growl", audioSrc: "/audio/sfx-growl.mp3", icon: Dog },
      { id: "dungeon-steps", name: "Footprints", audioSrc: "/audio/sfx-footsteps.mp3", icon: Footprints },
      { id: "dungeon-trap", name: "Trap!", audioSrc: "/audio/sfx-trap.mp3", icon: Zap },
      { id: "dungeon-magic", name: "Magic", audioSrc: "/audio/sfx-magic.mp3", icon: Sparkles },
      { id: "dungeon-ghost", name: "Whispers", audioSrc: "/audio/sfx-whisper.mp3", icon: Ghost },
      { id: "dungeon-collapse", name: "Collapse", audioSrc: "/audio/sfx-collapse.mp3", icon: Mountain },
    ],
  },
};

// ============================================
// NATURE TEMPLATES
// ============================================

const forestTemplate: BoardTemplate = {
  id: "forest",
  name: "Woodlands",
  description: "Peaceful woodland with birdsong and rustling leaves",
  category: "nature",
  mood: {
    id: "forest",
    name: "Woodlands",
    description: "A magical forest alive with nature",
    theme: {
      primary: "#059669",
      secondary: "#34d399",
      primaryForeground: "#ffffff",
    },
    ambience: [
      { id: "forest-birds", name: "Birds", audioSrc: "/audio/ambience-woodlands.mp3", icon: Bird },
      { id: "forest-wind", name: "Wind", audioSrc: "/audio/ambience-wind.mp3", icon: Wind },
      { id: "forest-stream", name: "Stream", audioSrc: "/audio/ambience-stream.mp3", icon: Waves },
      { id: "forest-insects", name: "Insects", audioSrc: "/audio/ambience-insects.mp3", icon: Bug },
    ],
    effects: [
      { id: "forest-branch", name: "Branch Snap", audioSrc: "/audio/sfx-branch.mp3", icon: TreePine },
      { id: "forest-owl", name: "Owl Hoot", audioSrc: "/audio/sfx-owl.mp3", icon: Moon },
      { id: "forest-wolf", name: "Wolf Howl", audioSrc: "/audio/sfx-wolf.mp3", icon: Dog },
      { id: "forest-magic", name: "Magic", audioSrc: "/audio/sfx-magic.mp3", icon: Sparkles },
      { id: "forest-steps", name: "Footprints", audioSrc: "/audio/sfx-footsteps.mp3", icon: Footprints },
      { id: "forest-thunder", name: "Thunder", audioSrc: "/audio/sfx-thunder.mp3", icon: Zap },
      { id: "forest-rain", name: "Rain Start", audioSrc: "/audio/sfx-rain.mp3", icon: CloudRain },
      { id: "forest-animal", name: "Animal", audioSrc: "/audio/sfx-animal.mp3", icon: Dog },
    ],
  },
};

const stormTemplate: BoardTemplate = {
  id: "storm",
  name: "Thunderstorm",
  description: "Dramatic storm with thunder, lightning, and heavy rain",
  category: "nature",
  mood: {
    id: "storm",
    name: "Thunderstorm",
    description: "A powerful storm rages outside",
    theme: {
      primary: "#1e40af",
      secondary: "#60a5fa",
      primaryForeground: "#ffffff",
    },
    ambience: [
      { id: "storm-rain", name: "Heavy Rain", audioSrc: "/audio/ambience-rain.mp3", icon: CloudRain },
      { id: "storm-wind", name: "Strong Wind", audioSrc: "/audio/ambience-wind.mp3", icon: Wind },
      { id: "storm-rumble", name: "Rumbling", audioSrc: "/audio/ambience-storm.mp3", icon: Zap },
      { id: "storm-indoor", name: "Indoor", audioSrc: "/audio/ambience-indoor.mp3", icon: Store },
    ],
    effects: [
      { id: "storm-thunder1", name: "Thunder 1", audioSrc: "/audio/sfx-thunder.mp3", icon: Zap },
      { id: "storm-thunder2", name: "Thunder 2", audioSrc: "/audio/sfx-thunder2.mp3", icon: Zap },
      { id: "storm-lightning", name: "Lightning", audioSrc: "/audio/sfx-lightning.mp3", icon: Zap },
      { id: "storm-crack", name: "Tree Crack", audioSrc: "/audio/sfx-crack.mp3", icon: TreePine },
      { id: "storm-window", name: "Window Rattle", audioSrc: "/audio/sfx-window.mp3", icon: Wind },
      { id: "storm-door", name: "Door Slam", audioSrc: "/audio/sfx-door.mp3", icon: Store },
      { id: "storm-drip", name: "Dripping", audioSrc: "/audio/sfx-drip.mp3", icon: Droplets },
      { id: "storm-gust", name: "Wind Gust", audioSrc: "/audio/sfx-gust.mp3", icon: Wind },
    ],
  },
};

const oceanTemplate: BoardTemplate = {
  id: "ocean",
  name: "Ocean Voyage",
  description: "Rolling waves, creaking ship, and ocean breeze",
  category: "nature",
  mood: {
    id: "ocean",
    name: "Ocean Voyage",
    description: "Sailing across the open sea",
    theme: {
      primary: "#0891b2",
      secondary: "#22d3ee",
      primaryForeground: "#ffffff",
    },
    ambience: [
      { id: "ocean-waves", name: "Waves", audioSrc: "/audio/ambience-ocean.mp3", icon: Waves },
      { id: "ocean-ship", name: "Ship Creak", audioSrc: "/audio/ambience-ship.mp3", icon: Ship },
      { id: "ocean-wind", name: "Sea Wind", audioSrc: "/audio/ambience-wind.mp3", icon: Wind },
      { id: "ocean-gulls", name: "Seagulls", audioSrc: "/audio/ambience-gulls.mp3", icon: Bird },
    ],
    effects: [
      { id: "ocean-splash", name: "Splash", audioSrc: "/audio/sfx-splash.mp3", icon: Waves },
      { id: "ocean-bell", name: "Ship Bell", audioSrc: "/audio/sfx-bell.mp3", icon: Bell },
      { id: "ocean-anchor", name: "Anchor", audioSrc: "/audio/sfx-anchor.mp3", icon: Anchor },
      { id: "ocean-cannon", name: "Cannon", audioSrc: "/audio/sfx-cannon.mp3", icon: Zap },
      { id: "ocean-whale", name: "Whale Song", audioSrc: "/audio/sfx-whale.mp3", icon: Waves },
      { id: "ocean-thunder", name: "Thunder", audioSrc: "/audio/sfx-thunder.mp3", icon: Zap },
      { id: "ocean-horn", name: "Foghorn", audioSrc: "/audio/sfx-foghorn.mp3", icon: Volume2 },
      { id: "ocean-storm", name: "Storm Wave", audioSrc: "/audio/sfx-bigwave.mp3", icon: Waves },
    ],
  },
};

// ============================================
// HORROR TEMPLATES
// ============================================

const hauntedTemplate: BoardTemplate = {
  id: "haunted",
  name: "Haunted Manor",
  description: "Creaking floors, whispers, and supernatural dread",
  category: "horror",
  mood: {
    id: "haunted",
    name: "Haunted Manor",
    description: "A decrepit mansion full of restless spirits",
    theme: {
      primary: "#581c87",
      secondary: "#a855f7",
      primaryForeground: "#ffffff",
    },
    ambience: [
      { id: "haunted-wind", name: "Howling Wind", audioSrc: "/audio/ambience-wind.mp3", icon: Wind },
      { id: "haunted-creak", name: "Creaking", audioSrc: "/audio/ambience-creak.mp3", icon: Store },
      { id: "haunted-whisper", name: "Whispers", audioSrc: "/audio/ambience-whisper.mp3", icon: Ghost },
      { id: "haunted-clock", name: "Clock", audioSrc: "/audio/ambience-clock.mp3", icon: Moon },
    ],
    effects: [
      { id: "haunted-scream", name: "Scream", audioSrc: "/audio/sfx-scream.mp3", icon: Skull },
      { id: "haunted-door", name: "Door Creak", audioSrc: "/audio/sfx-door-creak.mp3", icon: Store },
      { id: "haunted-ghost", name: "Ghost Wail", audioSrc: "/audio/sfx-ghost.mp3", icon: Ghost },
      { id: "haunted-thump", name: "Thump", audioSrc: "/audio/sfx-thump.mp3", icon: Volume2 },
      { id: "haunted-glass", name: "Glass Break", audioSrc: "/audio/sfx-glass.mp3", icon: Zap },
      { id: "haunted-laugh", name: "Evil Laugh", audioSrc: "/audio/sfx-evil-laugh.mp3", icon: Skull },
      { id: "haunted-steps", name: "Footprints", audioSrc: "/audio/sfx-footsteps.mp3", icon: Footprints },
      { id: "haunted-organ", name: "Organ", audioSrc: "/audio/sfx-organ.mp3", icon: Church },
    ],
  },
};

// ============================================
// ADVENTURE TEMPLATES
// ============================================

const campfireTemplate: BoardTemplate = {
  id: "campfire",
  name: "Campfire Rest",
  description: "Quiet night around the fire with distant wildlife",
  category: "adventure",
  mood: {
    id: "campfire",
    name: "Campfire Rest",
    description: "A peaceful night resting by the campfire",
    theme: {
      primary: "#ea580c",
      secondary: "#fb923c",
      primaryForeground: "#ffffff",
    },
    ambience: [
      { id: "camp-fire", name: "Fire", audioSrc: "/audio/ambience-campfire.mp3", icon: Flame },
      { id: "camp-night", name: "Night Sounds", audioSrc: "/audio/ambience-night.mp3", icon: Moon },
      { id: "camp-wind", name: "Light Wind", audioSrc: "/audio/ambience-wind.mp3", icon: Wind },
      { id: "camp-crickets", name: "Crickets", audioSrc: "/audio/ambience-insects.mp3", icon: Bug },
    ],
    effects: [
      { id: "camp-owl", name: "Owl", audioSrc: "/audio/sfx-owl.mp3", icon: Moon },
      { id: "camp-wolf", name: "Wolf Howl", audioSrc: "/audio/sfx-wolf.mp3", icon: Dog },
      { id: "camp-branch", name: "Branch Snap", audioSrc: "/audio/sfx-branch.mp3", icon: TreePine },
      { id: "camp-log", name: "Log Pop", audioSrc: "/audio/sfx-log.mp3", icon: Flame },
      { id: "camp-yawn", name: "Yawn", audioSrc: "/audio/sfx-yawn.mp3", icon: Moon },
      { id: "camp-snore", name: "Snoring", audioSrc: "/audio/sfx-snore.mp3", icon: Moon },
      { id: "camp-rustle", name: "Rustling", audioSrc: "/audio/sfx-rustle.mp3", icon: TreePine },
      { id: "camp-animal", name: "Animal", audioSrc: "/audio/sfx-animal.mp3", icon: Dog },
    ],
  },
};

const winterTemplate: BoardTemplate = {
  id: "winter",
  name: "Winter Journey",
  description: "Cold winds, crunching snow, and frozen landscapes",
  category: "adventure",
  mood: {
    id: "winter",
    name: "Winter Journey",
    description: "Traveling through a frozen wilderness",
    theme: {
      primary: "#0ea5e9",
      secondary: "#7dd3fc",
      primaryForeground: "#ffffff",
    },
    ambience: [
      { id: "winter-wind", name: "Cold Wind", audioSrc: "/audio/ambience-wind.mp3", icon: Wind },
      { id: "winter-snow", name: "Snowfall", audioSrc: "/audio/ambience-snow.mp3", icon: Snowflake },
      { id: "winter-ice", name: "Ice Creak", audioSrc: "/audio/ambience-ice.mp3", icon: Snowflake },
      { id: "winter-fire", name: "Fire", audioSrc: "/audio/ambience-campfire.mp3", icon: Flame },
    ],
    effects: [
      { id: "winter-crunch", name: "Snow Crunch", audioSrc: "/audio/sfx-snow.mp3", icon: Footprints },
      { id: "winter-avalanche", name: "Avalanche", audioSrc: "/audio/sfx-avalanche.mp3", icon: Mountain },
      { id: "winter-crack", name: "Ice Crack", audioSrc: "/audio/sfx-ice-crack.mp3", icon: Snowflake },
      { id: "winter-wolf", name: "Wolf", audioSrc: "/audio/sfx-wolf.mp3", icon: Dog },
      { id: "winter-shiver", name: "Shivering", audioSrc: "/audio/sfx-shiver.mp3", icon: Snowflake },
      { id: "winter-blizzard", name: "Blizzard", audioSrc: "/audio/sfx-blizzard.mp3", icon: Wind },
      { id: "winter-bell", name: "Sleigh Bell", audioSrc: "/audio/sfx-sleigh.mp3", icon: Bell },
      { id: "winter-bird", name: "Raven", audioSrc: "/audio/sfx-raven.mp3", icon: Bird },
    ],
  },
};

const marketTemplate: BoardTemplate = {
  id: "market",
  name: "Market Day",
  description: "Busy marketplace with vendors, crowds, and commerce",
  category: "adventure",
  mood: {
    id: "market",
    name: "Market Day",
    description: "A bustling town square filled with merchants",
    theme: {
      primary: "#ca8a04",
      secondary: "#facc15",
      primaryForeground: "#000000",
    },
    ambience: [
      { id: "market-crowd", name: "Crowd", audioSrc: "/audio/ambience-crowd.mp3", icon: Store },
      { id: "market-music", name: "Street Music", audioSrc: "/audio/ambience-music.mp3", icon: Volume2 },
      { id: "market-animals", name: "Animals", audioSrc: "/audio/ambience-animals.mp3", icon: Dog },
      { id: "market-bells", name: "Town Bells", audioSrc: "/audio/ambience-bells.mp3", icon: Bell },
    ],
    effects: [
      { id: "market-vendor", name: "Vendor Call", audioSrc: "/audio/sfx-vendor.mp3", icon: Store },
      { id: "market-coins", name: "Coins", audioSrc: "/audio/sfx-coins.mp3", icon: Sun },
      { id: "market-cart", name: "Cart", audioSrc: "/audio/sfx-cart.mp3", icon: Store },
      { id: "market-hammer", name: "Blacksmith", audioSrc: "/audio/sfx-hammer.mp3", icon: Hammer },
      { id: "market-chicken", name: "Chicken", audioSrc: "/audio/sfx-chicken.mp3", icon: Bird },
      { id: "market-dog", name: "Dog Bark", audioSrc: "/audio/sfx-dog.mp3", icon: Dog },
      { id: "market-bell", name: "Bell", audioSrc: "/audio/sfx-bell.mp3", icon: Bell },
      { id: "market-splash", name: "Water", audioSrc: "/audio/sfx-splash.mp3", icon: Droplets },
    ],
  },
};

// ============================================
// EXPORT ALL TEMPLATES
// ============================================

export const boardTemplates: BoardTemplate[] = [
  // Fantasy
  tavernTemplate,
  combatTemplate,
  dungeonTemplate,
  // Nature
  forestTemplate,
  stormTemplate,
  oceanTemplate,
  // Horror
  hauntedTemplate,
  // Adventure
  campfireTemplate,
  winterTemplate,
  marketTemplate,
];

// Helper functions
export function getTemplatesByCategory(category: TemplateCategory): BoardTemplate[] {
  return boardTemplates.filter((t) => t.category === category);
}

export function getTemplateById(id: string): BoardTemplate | undefined {
  return boardTemplates.find((t) => t.id === id);
}

export function getAllCategories(): TemplateCategory[] {
  return ["fantasy", "nature", "urban", "horror", "adventure"];
}
