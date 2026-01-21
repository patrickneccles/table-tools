import { Mood } from "./types";
import {
  Bird,
  Bug,
  CloudRain,
  Wind,
  Waves,
  Flame,
  Footprints,
  Zap,
  TreePine,
  Volume2,
  Dog,
  Store,
  Beer,
  Hammer,
  DoorOpen,
  Bell,
  Church,
  Droplets,
  ChessKnight,
} from "lucide-react";

/**
 * Sample moods for the mood board.
 * 
 * To use these, you'll need to add the corresponding audio files to your /public/audio/ folder.
 * Audio files should be in .mp3 or .wav format.
 * 
 * Themes use RGB-inspired glow colors for the stream deck aesthetic:
 * - primary: The accent color used when a button is active (background tint)
 * - secondary: The glow/RGB color that illuminates around active buttons
 * - primaryForeground: Text color on active buttons (usually white)
 */
export const sampleMoods: Mood[] = [
  {
    id: "woodlands",
    name: "Woodlands",
    description: "A peaceful forest setting with birds, streams, and wildlife",
    theme: {
      // Nature-inspired: emerald green with warm amber glow
      primary: "#059669",      // Emerald green
      secondary: "#34d399",    // Bright mint green glow
      primaryForeground: "#ffffff",
    },
    // 4 ambient loops for layered atmosphere
    ambience: [
      { id: "birds", name: "Birds", audioSrc: "/audio/ambience-woodlands.mp3", icon: Bird },
      { id: "stream", name: "Stream", audioSrc: "/audio/ambience-woodlands-stream.mp3", icon: Waves },
      { id: "wind", name: "Wind", audioSrc: "/audio/ambience-woodlands-wind.mp3", icon: Wind },
      { id: "campfire", name: "Campfire", audioSrc: "/audio/ambience-campfire.mp3", icon: Flame },
    ],
    // 8 effects for reactive moments
    effects: [
      { id: "thunder", name: "Thunder", audioSrc: "/audio/thunder.mp3", icon: Zap },
      { id: "rain", name: "Rain Burst", audioSrc: "/audio/ambience-woodlands-rain.mp3", icon: CloudRain },
      { id: "branch-snap", name: "Branches", audioSrc: "/audio/sfx-branch-snapping.mp3", icon: TreePine },
      { id: "wolf-snarl", name: "Snarls", audioSrc: "/audio/sfx-wolf-snarl.mp3", icon: Dog },
      { id: "elephant-roar", name: "Roar", audioSrc: "/audio/sfx-elephant-roar.mp3", icon: Volume2 },
      { id: "insects", name: "Insects", audioSrc: "/audio/ambience-woodlands-night.mp3", icon: Bug },
      { id: "footsteps", name: "Footsteps", audioSrc: "/audio/ambience-woodlands-footsteps.mp3", icon: Footprints },
      { id: "gallop", name: "Gallop", audioSrc: "/audio/ambience-generic-gallop.mp3", icon: ChessKnight },
    ],
  },
  {
    id: "town",
    name: "Town",
    description: "A bustling medieval town with markets, taverns, and craftsmen",
    theme: {
      // Warm tavern vibes: amber/orange with golden glow
      primary: "#d97706",      // Amber orange
      secondary: "#fbbf24",    // Golden yellow glow
      primaryForeground: "#ffffff",
    },
    // 4 ambient loops for town atmosphere
    ambience: [
      { id: "market", name: "Market", audioSrc: "/audio/ambience-town-market.mp3", icon: Store },
      { id: "tavern", name: "Tavern", audioSrc: "/audio/pub.mp3", icon: Beer },
      { id: "blacksmith", name: "Blacksmith", audioSrc: "/audio/ambience-town-blacksmith.mp3", icon: Hammer },
      { id: "town-wind", name: "Wind", audioSrc: "/audio/wind-sound-effect.wav", icon: Wind },
    ],
    // 8 effects for town interactions
    effects: [
      { id: "town-thunder", name: "Thunder", audioSrc: "/audio/thunder.mp3", icon: Zap },
      { id: "door", name: "Door", audioSrc: "/audio/door.mp3", icon: DoorOpen },
      { id: "shop-bell", name: "Shop Bell", audioSrc: "/audio/sfx-shop-bell.mp3", icon: Bell },
      { id: "church-bell", name: "Church Bell", audioSrc: "/audio/sfx-church-bells.mp3", icon: Church },
      { id: "town-rain", name: "Rain", audioSrc: "/audio/ambience-woodlands-rain.mp3", icon: CloudRain },
      { id: "town-river", name: "River", audioSrc: "/audio/ambience-generic-river.mp3", icon: Droplets },
      { id: "marching", name: "Marching", audioSrc: "/audio/ambience-marching.mp3", icon: Footprints },
      { id: "town-gallop", name: "Gallop", audioSrc: "/audio/ambience-generic-gallop.mp3", icon: ChessKnight },
    ],
  },
];

/**
 * Demo moods using free audio from browser APIs or placeholder sources.
 * These work without any audio files for testing the UI.
 */
export const demoMoods: Mood[] = [
  {
    id: "demo-ambient",
    name: "Demo Board",
    description: "A demo board to test the UI (requires audio files)",
    theme: {
      // Classic RGB: blue with cyan glow
      primary: "#3b82f6",      // Blue
      secondary: "#60a5fa",    // Light blue glow
      primaryForeground: "#ffffff",
    },
    ambience: [
      { id: "demo-amb-1", name: "Ambience 1", audioSrc: "/audio/demo-ambience-1.mp3", icon: Waves },
      { id: "demo-amb-2", name: "Ambience 2", audioSrc: "/audio/demo-ambience-2.mp3", icon: Wind },
      { id: "demo-amb-3", name: "Ambience 3", audioSrc: "/audio/demo-ambience-3.mp3", icon: CloudRain },
    ],
    effects: [
      { id: "demo-fx-1", name: "Effect 1", audioSrc: "/audio/demo-effect-1.mp3", icon: Zap },
      { id: "demo-fx-2", name: "Effect 2", audioSrc: "/audio/demo-effect-2.mp3", icon: Bell },
    ],
  },
];
