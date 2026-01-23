"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { MoodBoard, sampleMoods, Mood, boardTemplates, BoardTemplate } from "@/components/mood-board";
import { CommandPalette, useCommandPalette } from "@/components/mood-board/command-palette";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Wrench, Loader2, Command, Home, Music } from "lucide-react";
import { useAudioPreloader } from "@/lib/audio-manager";
import { Button } from "@/components/ui/button";

export default function MoodBoardPage() {
  const [currentMood, setCurrentMood] = useState<Mood>(sampleMoods[0]);
  const [isLightMode, setIsLightMode] = useState(false);
  
  // Command palette
  const { isOpen: commandOpen, setIsOpen: setCommandOpen } = useCommandPalette();
  
  // Refs for triggering sounds from command palette
  const soundTriggersRef = useRef<Map<string, () => void>>(new Map());

  // Get all audio URLs for the current mood
  const audioUrls = useMemo(() => {
    const urls: string[] = [];
    currentMood.ambience.forEach((s) => urls.push(s.audioSrc));
    currentMood.effects.forEach((s) => urls.push(s.audioSrc));
    return urls;
  }, [currentMood]);

  // Preload audio files for current mood
  const { progress: preloadProgress, isComplete: isPreloaded } = useAudioPreloader(audioUrls);

  // Check for existing light mode preference on mount and listen for changes
  useEffect(() => {
    const isLight = document.documentElement.classList.contains("light");
    setIsLightMode(isLight);
    
    // Listen for theme changes from global toggle
    const observer = new MutationObserver(() => {
      setIsLightMode(document.documentElement.classList.contains("light"));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    return () => observer.disconnect();
  }, []);

  // Toggle theme (for command palette)
  const toggleTheme = useCallback(() => {
    document.documentElement.classList.toggle("light");
  }, []);

  const theme = currentMood.theme;
  
  // Handle template selection from command palette
  const handleSelectTemplate = useCallback((template: BoardTemplate) => {
    setCurrentMood(template.mood);
  }, []);
  
  // Handle sound trigger from command palette (would need to connect to MoodBoard refs)
  const handleTriggerSound = useCallback((soundId: string, type: "ambience" | "effect") => {
    const trigger = soundTriggersRef.current.get(`${type}-${soundId}`);
    if (trigger) trigger();
  }, []);

  return (
    <div
      className={cn(
        "transition-colors duration-300",
        isLightMode ? "bg-[#f0f0f2]" : "bg-[#0a0a0b]"
      )}
    >
      {/* Subtle gradient background */}
      <div
        className={cn(
          "fixed inset-0 pointer-events-none transition-opacity duration-300",
          isLightMode ? "opacity-20" : "opacity-30"
        )}
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${theme?.secondary ?? "#3b82f6"}15 0%, transparent 50%)`,
        }}
      />

      <div className="relative container mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-xl transition-colors",
                isLightMode ? "bg-emerald-100" : "bg-emerald-900/20"
              )}
              style={{
                color: theme?.primary ?? "#22c55e",
              }}
            >
              <Music className="h-5 w-5" />
            </div>
            <div>
              <h1
                className={cn(
                  "text-xl font-bold tracking-tight transition-colors",
                  isLightMode ? "text-zinc-800" : "text-white"
                )}
              >
                Mood Board
              </h1>
              <p
                className={cn(
                  "transition-colors flex items-center gap-2 text-sm",
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                )}
              >
                Virtual soundboard for immersive audio
                {!isPreloaded && (
                  <span className="flex items-center gap-1 text-xs opacity-60">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading ({Math.round(preloadProgress * 100)}%)
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Home link */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "rounded-full text-xs",
                isLightMode
                  ? "bg-zinc-900/10 border border-zinc-900/10 text-zinc-600 hover:bg-zinc-900/20 hover:text-zinc-800"
                  : "bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
              )}
            >
              <Link href="/">
                <Home className="h-3 w-3" />
                <span className="hidden sm:inline ml-1">Home</span>
              </Link>
            </Button>
            {/* Command palette button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCommandOpen(true)}
              className={cn(
                "rounded-full text-xs gap-1.5",
                isLightMode
                  ? "bg-zinc-900/10 border border-zinc-900/10 text-zinc-600 hover:bg-zinc-900/20 hover:text-zinc-800"
                  : "bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
              )}
            >
              <Command className="h-3 w-3" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-mono bg-black/10 dark:bg-white/10 rounded">
                ⌘K
              </kbd>
            </Button>
            {/* Builder link */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "rounded-full text-xs",
                isLightMode
                  ? "bg-zinc-900/10 border border-zinc-900/10 text-zinc-600 hover:bg-zinc-900/20 hover:text-zinc-800"
                  : "bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
              )}
            >
              <Link href="/mood-board/builder">
                <Wrench className="h-3 w-3" />
                Builder
              </Link>
            </Button>
          </div>
        </div>

        {/* Mood Selector - styled like keyboard profile selector */}
        <div className="mb-8">
          <div
            className={cn(
              "inline-flex gap-1 p-1 rounded-xl transition-colors",
              isLightMode
                ? "bg-white border border-zinc-200 shadow-sm"
                : "bg-black/50 border border-white/5"
            )}
          >
            {sampleMoods.map((mood) => {
              const isSelected = currentMood.id === mood.id;
              const moodColor = mood.theme?.secondary ?? "#3b82f6";

              return (
                <Button
                  key={mood.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMood(mood)}
                  className={cn(
                    "rounded-lg",
                    isSelected
                      ? isLightMode
                        ? "text-zinc-800 shadow-md"
                        : "text-white shadow-lg"
                      : isLightMode
                        ? "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                  )}
                  style={
                    isSelected
                      ? {
                          background: isLightMode
                            ? `linear-gradient(135deg, ${moodColor}20 0%, ${moodColor}10 100%)`
                            : `linear-gradient(135deg, ${moodColor}40 0%, ${moodColor}20 100%)`,
                          boxShadow: `0 4px 20px ${moodColor}${isLightMode ? "20" : "30"}`,
                        }
                      : undefined
                  }
                >
                  {mood.name}
                </Button>
              );
            })}
          </div>
          {currentMood.description && (
            <p
              className={cn(
                "mt-3 text-sm transition-colors",
                isLightMode ? "text-zinc-500" : "text-zinc-500"
              )}
            >
              {currentMood.description}
            </p>
          )}
        </div>

        {/* Mood Board - Effect Heavy layout: effects first, square effects, rectangular ambience */}
        <MoodBoard 
          mood={currentMood} 
          isLightMode={isLightMode} 
          effectsFirst 
          squareEffects 
          rectangularAmbience 
        />

        {/* Footer Info - subtle panel */}
        <div
          className={cn(
            "mt-12 rounded-xl p-4 transition-colors",
            isLightMode
              ? "bg-white border border-zinc-200 shadow-sm"
              : "bg-black/30 border border-white/5"
          )}
        >
          <h2
            className={cn(
              "font-medium transition-colors",
              isLightMode ? "text-zinc-700" : "text-zinc-300"
            )}
          >
            Getting Started
          </h2>
          <p
            className={cn(
              "mt-1 text-sm transition-colors",
              isLightMode ? "text-zinc-500" : "text-zinc-500"
            )}
          >
            Add audio files to{" "}
            <code
              className={cn(
                "rounded px-1.5 py-0.5 font-mono text-xs transition-colors",
                isLightMode
                  ? "bg-zinc-100 text-zinc-600"
                  : "bg-white/5 text-zinc-400"
              )}
            >
              public/audio/
            </code>
            . Ambience sounds loop continuously, effects play once. Use the fade
            toggle for smooth transitions. Press{" "}
            <kbd
              className={cn(
                "rounded px-1.5 py-0.5 font-mono text-xs transition-colors",
                isLightMode
                  ? "bg-zinc-100 text-zinc-600"
                  : "bg-white/5 text-zinc-400"
              )}
            >
              ⌘K
            </kbd>{" "}
            for quick search.
          </p>
        </div>
      </div>
      
      {/* Command Palette */}
      <CommandPalette
        mood={currentMood}
        isOpen={commandOpen}
        onOpenChange={setCommandOpen}
        onTriggerSound={handleTriggerSound}
        onSelectTemplate={handleSelectTemplate}
        onToggleTheme={toggleTheme}
        isLightMode={isLightMode}
      />
    </div>
  );
}
