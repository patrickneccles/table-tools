'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { getSoundsByCategory, getAllTags, searchSounds } from './sound-registry';
import { DraggableSoundItem } from './draggable-sound';
import { Search, Filter } from 'lucide-react';

type SoundPaletteProps = {
  isLightMode?: boolean;
  placedSoundIds?: Set<string>; // IDs of sounds currently on the board
};

export function SoundPalette({
  isLightMode = false,
  placedSoundIds = new Set(),
}: SoundPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ambience' | 'effect'>('ambience');
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
        'flex flex-col h-full rounded-xl border overflow-hidden',
        isLightMode ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
      )}
    >
      {/* Header */}
      <div
        className={cn('px-4 py-3 border-b', isLightMode ? 'border-zinc-200' : 'border-zinc-800')}
      >
        <h3
          className={cn(
            'text-sm font-semibold uppercase tracking-wide',
            isLightMode ? 'text-zinc-700' : 'text-zinc-300'
          )}
        >
          Sound Library
        </h3>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search
            className={cn(
              'absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none',
              isLightMode ? 'text-zinc-400' : 'text-zinc-500'
            )}
          />
          <Input
            type="text"
            placeholder="Search sounds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-3 pb-2">
        <ToggleGroup
          type="single"
          size="sm"
          value={activeCategory}
          onValueChange={(val) => {
            if (val) setActiveCategory(val as 'ambience' | 'effect');
          }}
          className={cn('w-full rounded-lg p-1', isLightMode ? 'bg-zinc-100' : 'bg-zinc-800')}
        >
          <ToggleGroupItem value="ambience" className="flex-1 text-xs">
            Ambience
          </ToggleGroupItem>
          <ToggleGroupItem value="effect" className="flex-1 text-xs">
            Effects
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Tag Filter */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-1 flex-wrap">
          <Filter
            className={cn('h-3 w-3 mr-1 shrink-0', isLightMode ? 'text-zinc-400' : 'text-zinc-500')}
          />
          <Toggle
            size="sm"
            pressed={selectedTag === null}
            onPressedChange={() => setSelectedTag(null)}
            className="h-6 px-2 text-xs rounded"
          >
            All
          </Toggle>
          {allTags.slice(0, 8).map((tag) => (
            <Toggle
              key={tag}
              size="sm"
              pressed={selectedTag === tag}
              onPressedChange={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className="h-6 px-2 text-xs rounded"
            >
              {tag}
            </Toggle>
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
                'text-center py-8 text-sm',
                isLightMode ? 'text-zinc-400' : 'text-zinc-500'
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
            'px-3 py-2 border-t text-xs',
            isLightMode ? 'border-zinc-200 text-zinc-500' : 'border-zinc-800 text-zinc-500'
          )}
        >
          {placedSoundIds.size} sound{placedSoundIds.size !== 1 ? 's' : ''} on board
        </div>
      )}
    </div>
  );
}
