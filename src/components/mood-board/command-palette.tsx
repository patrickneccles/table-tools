"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Mood, Sound } from "./types";
import { boardTemplates, BoardTemplate } from "./board-templates";
import {
  Palette,
  Volume2,
  Zap,
  Sun,
  Moon,
  LayoutTemplate,
} from "lucide-react";

type CommandPaletteProps = {
  mood: Mood;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTriggerSound?: (soundId: string, type: "ambience" | "effect") => void;
  onSelectTemplate?: (template: BoardTemplate) => void;
  onToggleTheme?: () => void;
  isLightMode?: boolean;
};

export function CommandPalette({
  mood,
  isOpen,
  onOpenChange,
  onTriggerSound,
  onSelectTemplate,
  onToggleTheme,
  isLightMode = false,
}: CommandPaletteProps) {
  const handleSoundSelect = useCallback(
    (sound: Sound, type: "ambience" | "effect") => {
      onTriggerSound?.(sound.id, type);
      onOpenChange(false);
    },
    [onTriggerSound, onOpenChange]
  );

  const handleTemplateSelect = useCallback(
    (template: BoardTemplate) => {
      onSelectTemplate?.(template);
      onOpenChange(false);
    },
    [onSelectTemplate, onOpenChange]
  );

  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search sounds, templates, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions */}
        {onToggleTheme && (
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => { onToggleTheme(); onOpenChange(false); }}>
              {isLightMode ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
              <span>Toggle {isLightMode ? "Dark" : "Light"} Mode</span>
            </CommandItem>
          </CommandGroup>
        )}

        {onToggleTheme && <CommandSeparator />}

        {/* Current Mood Sounds */}
        {mood.ambience.length > 0 && (
          <CommandGroup heading="Ambience">
            {mood.ambience.map((sound, index) => {
              const Icon = sound.icon || Volume2;
              const hotkey = ["Q", "W", "E", "R"][index];
              return (
                <CommandItem
                  key={sound.id}
                  onSelect={() => handleSoundSelect(sound, "ambience")}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{sound.name}</span>
                  {hotkey && <CommandShortcut>{hotkey}</CommandShortcut>}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {mood.effects.length > 0 && (
          <CommandGroup heading="Effects">
            {mood.effects.map((sound, index) => {
              const Icon = sound.icon || Zap;
              const hotkeys = ["A", "S", "D", "F", "Z", "X", "C", "V"];
              const hotkey = hotkeys[index];
              return (
                <CommandItem
                  key={sound.id}
                  onSelect={() => handleSoundSelect(sound, "effect")}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{sound.name}</span>
                  {hotkey && <CommandShortcut>{hotkey}</CommandShortcut>}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Board Templates */}
        <CommandGroup heading="Templates">
          {boardTemplates.slice(0, 6).map((template) => (
            <CommandItem
              key={template.id}
              onSelect={() => handleTemplateSelect(template)}
            >
              <LayoutTemplate className="mr-2 h-4 w-4" />
              <span>{template.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {template.category}
              </span>
            </CommandItem>
          ))}
          <CommandItem
            onSelect={() => {
              // Could open a template browser modal
              onOpenChange(false);
            }}
            className="text-muted-foreground"
          >
            <Palette className="mr-2 h-4 w-4" />
            <span>Browse all templates...</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

/**
 * Hook to manage command palette state with keyboard shortcuts
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isOpen,
    setIsOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((o) => !o),
  };
}
