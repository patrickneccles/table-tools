import {
  Bird,
  Bug,
  CloudRain,
  Wind,
  Waves,
  Moon,
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
  Castle,
  Megaphone,
  Droplets,
  ChessKnight,
  Swords,
  Ship,
  Anchor,
  Mountain,
  Snowflake,
  Sun,
  Cloud,
  Music,
  Drum,
  Guitar,
  Piano,
  Mic,
  Radio,
  Tv,
  Car,
  Train,
  Plane,
  Bike,
  Heart,
  Skull,
  Ghost,
  Sparkles,
  Stars,
  CircleDot,
} from "lucide-react";
import { SoundDefinition } from "./types";

/**
 * Master registry of all available sounds
 * This can be extended by adding more entries
 * In a production app, this could be fetched from an API
 */
export const soundRegistry: SoundDefinition[] = [
  // === AMBIENCE SOUNDS ===
  // Nature
  { id: "birds", name: "Birds", audioSrc: "/audio/ambience-woodlands.mp3", icon: Bird, category: "ambience", tags: ["nature", "forest", "peaceful"] },
  { id: "insects", name: "Insects", audioSrc: "/audio/ambience-woodlands-night.mp3", icon: Bug, category: "ambience", tags: ["nature", "night", "forest"] },
  { id: "rain", name: "Rain", audioSrc: "/audio/ambience-woodlands-rain.mp3", icon: CloudRain, category: "ambience", tags: ["weather", "nature", "calming"] },
  { id: "wind", name: "Wind", audioSrc: "/audio/ambience-woodlands-wind.mp3", icon: Wind, category: "ambience", tags: ["weather", "nature"] },
  { id: "stream", name: "Stream", audioSrc: "/audio/ambience-woodlands-stream.mp3", icon: Waves, category: "ambience", tags: ["water", "nature", "peaceful"] },
  { id: "river", name: "River", audioSrc: "/audio/ambience-generic-river.mp3", icon: Droplets, category: "ambience", tags: ["water", "nature"] },
  { id: "howls", name: "Wolf Howls", audioSrc: "/audio/ambience-woodland-wolves.mp3", icon: Moon, category: "ambience", tags: ["nature", "night", "spooky"] },
  { id: "campfire", name: "Campfire", audioSrc: "/audio/ambience-campfire.mp3", icon: Flame, category: "ambience", tags: ["fire", "camping", "cozy"] },
  
  // Movement
  { id: "footsteps", name: "Footsteps", audioSrc: "/audio/ambience-woodlands-footsteps.mp3", icon: Footprints, category: "ambience", tags: ["movement", "walking"] },
  { id: "gallop", name: "Gallop", audioSrc: "/audio/ambience-generic-gallop.mp3", icon: ChessKnight, category: "ambience", tags: ["movement", "horse"] },
  { id: "marching", name: "Marching", audioSrc: "/audio/ambience-marching.mp3", icon: Footprints, category: "ambience", tags: ["movement", "military"] },
  
  // Town/Urban
  { id: "market", name: "Market", audioSrc: "/audio/ambience-town-market.mp3", icon: Store, category: "ambience", tags: ["town", "crowd", "busy"] },
  { id: "tavern", name: "Tavern", audioSrc: "/audio/pub.mp3", icon: Beer, category: "ambience", tags: ["town", "social", "cozy"] },
  { id: "blacksmith", name: "Blacksmith", audioSrc: "/audio/ambience-town-blacksmith.mp3", icon: Hammer, category: "ambience", tags: ["town", "craft", "medieval"] },
  
  // Placeholder/Generic
  { id: "ocean", name: "Ocean Waves", audioSrc: "/audio/ambience-ocean.mp3", icon: Waves, category: "ambience", tags: ["water", "nature", "peaceful"] },
  { id: "thunder-loop", name: "Storm", audioSrc: "/audio/ambience-storm.mp3", icon: CloudRain, category: "ambience", tags: ["weather", "dramatic"] },
  { id: "cave", name: "Cave Drips", audioSrc: "/audio/ambience-cave.mp3", icon: Mountain, category: "ambience", tags: ["underground", "spooky"] },
  { id: "ship-deck", name: "Ship Deck", audioSrc: "/audio/ambience-ship.mp3", icon: Ship, category: "ambience", tags: ["nautical", "adventure"] },
  { id: "battle", name: "Distant Battle", audioSrc: "/audio/ambience-battle.mp3", icon: Swords, category: "ambience", tags: ["combat", "dramatic"] },
  
  // === EFFECT SOUNDS ===
  // Weather
  { id: "thunder", name: "Thunder", audioSrc: "/audio/thunder.mp3", icon: Zap, category: "effect", tags: ["weather", "dramatic"] },
  
  // Nature
  { id: "branch-snap", name: "Branch Snap", audioSrc: "/audio/sfx-branch-snapping.mp3", icon: TreePine, category: "effect", tags: ["nature", "forest"] },
  { id: "elephant-roar", name: "Trumpeted Roar", audioSrc: "/audio/sfx-elephant-roar.mp3", icon: Volume2, category: "effect", tags: ["animal", "dramatic"] },
  { id: "lion-growl", name: "Deep Growl", audioSrc: "/audio/sfx-lion-growl.mp3", icon: Volume2, category: "effect", tags: ["animal", "predator"] },
  { id: "wolf-snarl", name: "Wolf Snarl", audioSrc: "/audio/sfx-wolf-snarl.mp3", icon: Dog, category: "effect", tags: ["animal", "predator"] },
  
  // Town
  { id: "door", name: "Door", audioSrc: "/audio/door.mp3", icon: DoorOpen, category: "effect", tags: ["town", "building"] },
  { id: "shop-bell", name: "Shop Bell", audioSrc: "/audio/sfx-shop-bell.mp3", icon: Bell, category: "effect", tags: ["town", "shop"] },
  { id: "church-bell", name: "Church Bell", audioSrc: "/audio/sfx-church-bells.mp3", icon: Church, category: "effect", tags: ["town", "religious"] },
  { id: "drawbridge", name: "Drawbridge", audioSrc: "/audio/sfx-town-drawbridge.mp3", icon: Castle, category: "effect", tags: ["medieval", "dramatic"] },
  { id: "hunting-horn", name: "Hunting Horn", audioSrc: "/audio/sfx-fox-hunt-horn.mp3", icon: Megaphone, category: "effect", tags: ["signal", "medieval"] },
  
  // Combat/Action
  { id: "sword-clash", name: "Sword Clash", audioSrc: "/audio/sfx-sword-clash.mp3", icon: Swords, category: "effect", tags: ["combat", "action"] },
  { id: "arrow-fire", name: "Arrow Fire", audioSrc: "/audio/sfx-arrow.mp3", icon: CircleDot, category: "effect", tags: ["combat", "ranged"] },
  
  // Magic/Fantasy
  { id: "magic-spell", name: "Magic Spell", audioSrc: "/audio/sfx-magic.mp3", icon: Sparkles, category: "effect", tags: ["magic", "fantasy"] },
  { id: "ghost-moan", name: "Ghost Moan", audioSrc: "/audio/sfx-ghost.mp3", icon: Ghost, category: "effect", tags: ["spooky", "undead"] },
];

/**
 * Get all sounds in a category
 */
export function getSoundsByCategory(category: "ambience" | "effect"): SoundDefinition[] {
  return soundRegistry.filter((s) => s.category === category);
}

/**
 * Get a sound by ID
 */
export function getSoundById(id: string): SoundDefinition | undefined {
  return soundRegistry.find((s) => s.id === id);
}

/**
 * Search sounds by name or tags
 */
export function searchSounds(query: string): SoundDefinition[] {
  const lowerQuery = query.toLowerCase();
  return soundRegistry.filter(
    (s) =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get sounds by tag
 */
export function getSoundsByTag(tag: string): SoundDefinition[] {
  return soundRegistry.filter((s) => s.tags?.includes(tag));
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  soundRegistry.forEach((s) => s.tags?.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}
