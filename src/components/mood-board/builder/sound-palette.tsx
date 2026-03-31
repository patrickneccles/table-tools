"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { getSoundsByCategory, getAllTags, searchSounds } from "./sound-registry";
import { DraggableSoundItem } from "./draggable-sound";
import { Search, Filter } from "lucide-react";

type SoundPaletteProps = {
  isLightMode?: boolean;
  placedSoundIds?: Set<string>; // IDs of sounds currently on the board
};

export function SoundPalette({ 
  isLightMode = false,
  placedSoundIds = new Set(),
}: SoundPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"ambience" | "effect">("ambience");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => getAllTags(), []);

  const filteredSounds = useMemo(() => {
    let sounds = getSoundsByCategory(activeCategory);

    if (searchQuery) {
      const searchResults = searchSounds(searchQuery);
      sounds = sounds.filter((s) => searchResults.includes(s));
    }

    if (selectedTag) {
      sounds = sounds.filter((s) => s.tags?.includes(selectedTag));
    }

    return sounds;
  }, [activeCategory, searchQuery, selectedTag]);

  return (
    <div
      className={cn(
        "flex flex-col h-full rounded-xl border overflow-hidden",
        isLightMode
          ? "bg-white border-zinc-200"
          : "bg-zinc-900 border-zinc-800"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "px-4 py-3 border-b",
          isLightMode ? "border-zinc-200" : "border-zinc-800"
        )}
      >
        <h3
          className={cn(
            "text-sm font-semibold uppercase tracking-wide",
            isLightMode ? "text-zinc-700" : "text-zinc-300"
          )}
        >
          Sound Library
        </h3>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg",
            isLightMode ? "bg-zinc-100" : "bg-zinc-800"
          )}
        >
          <Search
            className={cn(
              "h-4 w-4 flex-shrink-0",
              isLightMode ? "text-zinc-400" : "text-zinc-500"
            )}
          />
          <input
            type="text"
            placeholder="Search sounds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-500",
              isLightMode ? "text-zinc-700" : "text-zinc-300"
            )}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-3 pb-2">
        <div
          className={cn(
            "flex gap-1 p-1 rounded-lg",
            isLightMode ? "bg-zinc-100" : "bg-zinc-800"
          )}
        >
          {(["ambience", "effect"] as const).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                activeCategory === category
                  ? isLightMode
                    ? "bg-white text-zinc-800 shadow-sm"
                    : "bg-zinc-700 text-white"
                  : isLightMode
                    ? "text-zinc-500 hover:text-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {category === "ambience" ? "Ambience" : "Effects"}
            </button>
          ))}
        </div>
      </div>

      {/* Tag Filter */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-1 flex-wrap">
          <Filter
            className={cn(
              "h-3 w-3 mr-1",
              isLightMode ? "text-zinc-400" : "text-zinc-500"
            )}
          />
          <button
            onClick={() => setSelectedTag(null)}
            className={cn(
              "px-2 py-0.5 rounded text-xs transition-colors",
              selectedTag === null
                ? isLightMode
                  ? "bg-zinc-800 text-white"
                  : "bg-zinc-200 text-zinc-800"
                : isLightMode
                  ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
          >
            All
          </button>
          {allTags.slice(0, 8).map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={cn(
                "px-2 py-0.5 rounded text-xs transition-colors",
                selectedTag === tag
                  ? isLightMode
                    ? "bg-zinc-800 text-white"
                    : "bg-zinc-200 text-zinc-800"
                  : isLightMode
                    ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Sound List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="grid grid-cols-1 gap-2">
          {filteredSounds.map((sound) => (
            <DraggableSoundItem
              key={sound.id}
              sound={sound}
              isLightMode={isLightMode}
              isPlaced={placedSoundIds.has(sound.id)}
            />
          ))}
          {filteredSounds.length === 0 && (
            <div
              className={cn(
                "text-center py-8 text-sm",
                isLightMode ? "text-zinc-400" : "text-zinc-500"
              )}
            >
              No sounds found
            </div>
          )}
        </div>
      </div>

      {/* Placed count */}
      {placedSoundIds.size > 0 && (
        <div
          className={cn(
            "px-3 py-2 border-t text-xs",
            isLightMode 
              ? "border-zinc-200 text-zinc-500" 
              : "border-zinc-800 text-zinc-500"
          )}
        >
          {placedSoundIds.size} sound{placedSoundIds.size !== 1 ? "s" : ""} on board
        </div>
      )}
    </div>
  );
}
