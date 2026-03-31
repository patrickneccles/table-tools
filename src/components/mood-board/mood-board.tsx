"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Volume2, VolumeX, Waves, ChevronDown, AudioWaveform, ArrowDownUp } from "lucide-react";
import { Mood, MoodTheme } from "./types";
import { SoundButton } from "./sound-button";
import { cn } from "@/lib/utils";
import { useAudioPresets } from "@/lib/audio-manager";

// Hotkey mapping by visual row: QWER (row 0), ASDF (row 1), ZXCV (row 2)
// Each key maps to { row, col } position in the visual grid
const HOTKEY_GRID: Record<string, { row: number; col: number }> = {
  // Row 0 (top)
  q: { row: 0, col: 0 },
  w: { row: 0, col: 1 },
  e: { row: 0, col: 2 },
  r: { row: 0, col: 3 },
  // Row 1 (middle)
  a: { row: 1, col: 0 },
  s: { row: 1, col: 1 },
  d: { row: 1, col: 2 },
  f: { row: 1, col: 3 },
  // Row 2 (bottom)
  z: { row: 2, col: 0 },
  x: { row: 2, col: 1 },
  c: { row: 2, col: 2 },
  v: { row: 2, col: 3 },
};

// Get hotkey for a given type, index, and layout configuration
function getHotkey(
  type: "ambience" | "effect",
  index: number,
  effectsFirst: boolean,
  effectCount: number,
  ambienceCount: number
): string | undefined {
  // Calculate which visual row and column this sound occupies
  const effectRows = Math.ceil(effectCount / 4);
  const ambienceRows = Math.ceil(ambienceCount / 4);

  let visualRow: number;
  let visualCol: number;

  if (effectsFirst) {
    // Effects come first, then ambience
    if (type === "effect") {
      visualRow = Math.floor(index / 4);
      visualCol = index % 4;
    } else {
      // Ambience starts after all effect rows
      visualRow = effectRows + Math.floor(index / 4);
      visualCol = index % 4;
    }
  } else {
    // Ambience comes first, then effects
    if (type === "ambience") {
      visualRow = Math.floor(index / 4);
      visualCol = index % 4;
    } else {
      // Effects start after all ambience rows
      visualRow = ambienceRows + Math.floor(index / 4);
      visualCol = index % 4;
    }
  }

  // Find the key that maps to this position
  for (const [key, pos] of Object.entries(HOTKEY_GRID)) {
    if (pos.row === visualRow && pos.col === visualCol) {
      return key;
    }
  }
  return undefined;
}

const defaultTheme: MoodTheme = {
  primary: "#3b82f6",      // Blue
  secondary: "#60a5fa",    // Lighter blue glow
  primaryForeground: "#ffffff",
};

type MoodBoardProps = {
  mood: Mood;
  isLightMode?: boolean;
  effectsFirst?: boolean; // When true, effects section appears above ambience
  squareEffects?: boolean; // When true, effects use large square buttons
  rectangularAmbience?: boolean; // When true, ambience uses short rectangular buttons
};

export function MoodBoard({
  mood,
  isLightMode = false,
  effectsFirst = false,
  squareEffects = false,
  rectangularAmbience = false,
}: MoodBoardProps) {
  // Audio controls hook
  const {
    presets,
    currentPreset,
    setPreset,
    duckingEnabled,
    toggleDucking,
    fadeEnabled,
    toggleFade,
    volume,
    setVolume,
  } = useAudioPresets();

  // Create stable refs for all possible slots (4 ambience + 8 effects)
  const ambienceRef0 = useRef<(() => void) | null>(null);
  const ambienceRef1 = useRef<(() => void) | null>(null);
  const ambienceRef2 = useRef<(() => void) | null>(null);
  const ambienceRef3 = useRef<(() => void) | null>(null);
  const effectRef0 = useRef<(() => void) | null>(null);
  const effectRef1 = useRef<(() => void) | null>(null);
  const effectRef2 = useRef<(() => void) | null>(null);
  const effectRef3 = useRef<(() => void) | null>(null);
  const effectRef4 = useRef<(() => void) | null>(null);
  const effectRef5 = useRef<(() => void) | null>(null);
  const effectRef6 = useRef<(() => void) | null>(null);
  const effectRef7 = useRef<(() => void) | null>(null);

  const ambienceRefs = [ambienceRef0, ambienceRef1, ambienceRef2, ambienceRef3];
  const effectRefs = [
    effectRef0, effectRef1, effectRef2, effectRef3,
    effectRef4, effectRef5, effectRef6, effectRef7,
  ];

  const audioVolume = volume / 100;
  const theme = mood.theme ?? defaultTheme;

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't hijack browser shortcuts (Cmd/Ctrl + key, Alt + key)
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    // Ignore if user is typing in an input, textarea, or contenteditable
    const target = event.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }

    const key = event.key.toLowerCase();
    const gridPos = HOTKEY_GRID[key];

    if (gridPos) {
      event.preventDefault();

      // Calculate which sound to trigger based on visual position
      const effectRows = Math.ceil(mood.effects.length / 4);
      const ambienceRows = Math.ceil(mood.ambience.length / 4);

      let type: "ambience" | "effect";
      let index: number;

      if (effectsFirst) {
        // Effects first, then ambience
        if (gridPos.row < effectRows) {
          type = "effect";
          index = gridPos.row * 4 + gridPos.col;
        } else {
          type = "ambience";
          index = (gridPos.row - effectRows) * 4 + gridPos.col;
        }
      } else {
        // Ambience first, then effects
        if (gridPos.row < ambienceRows) {
          type = "ambience";
          index = gridPos.row * 4 + gridPos.col;
        } else {
          type = "effect";
          index = (gridPos.row - ambienceRows) * 4 + gridPos.col;
        }
      }

      // Trigger the sound if it exists
      if (type === "ambience") {
        const trigger = ambienceRefs[index]?.current;
        if (trigger) trigger();
      } else {
        const trigger = effectRefs[index]?.current;
        if (trigger) trigger();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectsFirst, mood.effects.length, mood.ambience.length]); // Include layout dependencies

  // Attach keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div
      className="relative"
      style={{
        // Scope board theme colors as CSS custom properties
        "--board-primary": theme.primary,
        "--board-secondary": theme.secondary,
        "--board-foreground": theme.primaryForeground,
      } as React.CSSProperties}
    >
      {/* Device enclosure - outer casing */}
      <div
        className={cn(
          "relative rounded-2xl sm:rounded-3xl overflow-hidden",
          "p-[2px] transition-all duration-300",
          isLightMode
            ? "bg-gradient-to-b from-[#e4e4e7] via-[#d4d4d8] to-[#a1a1aa] shadow-[0_8px_32px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.8)]"
            : "bg-gradient-to-b from-[#27272a] via-[#1f1f23] to-[#18181b] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]"
        )}
      >
        {/* Inner device panel */}
        <div
          className={cn(
            "rounded-[14px] sm:rounded-[22px]",
            "p-4 sm:p-6 transition-colors duration-300",
            isLightMode
              ? "bg-gradient-to-b from-[#fafafa] to-[#f4f4f5]"
              : "bg-gradient-to-b from-[#141416] to-[#0c0c0d]"
          )}
        >
          <div className="flex flex-col gap-6 sm:justify-between sm:flex-row">

            {/* Sound Buttons - the keycap grid */}
            <div className="flex flex-1 flex-col gap-6">
              {/* Render sections in correct order based on effectsFirst */}
              {(effectsFirst ? ["effects", "ambience"] : ["ambience", "effects"]).map((section) =>
                section === "ambience" ? (
                  mood.ambience.length > 0 && (
                    <div key="ambience" className="space-y-3">
                      <h3
                        className="text-xs font-semibold uppercase tracking-widest px-1"
                        style={{ color: isLightMode ? theme.primary : theme.secondary }}
                      >
                        Ambience
                      </h3>
                      {/* Keycap well/plate background */}
                      <div
                        className={cn(
                          "rounded-xl p-3 transition-colors",
                          isLightMode
                            ? "bg-zinc-100 border border-zinc-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                            : "bg-black/50 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]"
                        )}
                      >
                        <div className="grid grid-cols-4 gap-2 md:gap-4">
                          {mood.ambience.map((sound, index) => (
                            <SoundButton
                              key={sound.id}
                              sound={sound}
                              fade={fadeEnabled}
                              loop
                              volume={audioVolume}
                              theme={theme}
                              isLightMode={isLightMode}
                              hotkey={getHotkey("ambience", index, effectsFirst, mood.effects.length, mood.ambience.length)}
                              triggerRef={ambienceRefs[index]}
                              square={rectangularAmbience ? false : undefined}
                              soundType="ambience"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  mood.effects.length > 0 && (
                    <div key="effects" className="space-y-3">
                      <h3
                        className="text-xs font-semibold uppercase tracking-widest px-1"
                        style={{ color: isLightMode ? theme.primary : theme.secondary }}
                      >
                        Effects
                      </h3>
                      {/* Keycap well/plate background */}
                      <div
                        className={cn(
                          "rounded-xl p-3 transition-colors",
                          isLightMode
                            ? "bg-zinc-100 border border-zinc-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                            : "bg-black/50 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]"
                        )}
                      >
                        <div className="grid grid-cols-4 gap-2 md:gap-4">
                          {mood.effects.map((sound, index) => (
                            <SoundButton
                              key={sound.id}
                              sound={sound}
                              volume={audioVolume}
                              theme={theme}
                              isLightMode={isLightMode}
                              hotkey={getHotkey("effect", index, effectsFirst, mood.effects.length, mood.ambience.length)}
                              triggerRef={effectRefs[index]}
                              square={squareEffects ? true : undefined}
                              soundType="effect"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </div>

            {/* Controls Panel - minimal sidebar */}
            <TooltipProvider delayDuration={300}>
              <div
                className={cn(
                  "flex items-center gap-1.5 sm:flex-col sm:items-stretch sm:gap-3",
                  "p-1.5 sm:p-3 rounded-xl transition-colors",
                  isLightMode
                    ? "bg-zinc-100/80"
                    : "bg-black/30"
                )}
              >
                {/* Toggle buttons - inline on mobile, stacked on desktop */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle
                      pressed={fadeEnabled}
                      onPressedChange={toggleFade}
                      aria-label="Toggle fade"
                      size="sm"
                      className={cn(
                        fadeEnabled
                          ? isLightMode
                            ? "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                            : "bg-white/10 text-white hover:bg-white/20"
                          : isLightMode
                            ? "text-zinc-400 hover:bg-zinc-200/50 hover:text-zinc-600"
                            : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                      )}
                    >
                      <AudioWaveform />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Fade {fadeEnabled ? "On" : "Off"}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle
                      pressed={duckingEnabled}
                      onPressedChange={toggleDucking}
                      aria-label="Toggle ducking"
                      size="sm"
                      className={cn(
                        duckingEnabled
                          ? isLightMode
                            ? "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                            : "bg-white/10 text-white hover:bg-white/20"
                          : isLightMode
                            ? "text-zinc-400 hover:bg-zinc-200/50 hover:text-zinc-600"
                            : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                      )}
                    >
                      <ArrowDownUp />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Ducking {duckingEnabled ? "On" : "Off"}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Preset selector */}
                <Popover>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-9 w-9 sm:w-auto sm:px-2 shrink-0",
                            currentPreset.id !== "none"
                              ? isLightMode
                                ? "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                                : "bg-white/10 text-white hover:bg-white/20"
                              : isLightMode
                                ? "text-zinc-400 hover:bg-zinc-200/50 hover:text-zinc-600"
                                : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                          )}
                        >
                          <Waves className="h-4 w-4" />
                          <ChevronDown className="h-3 w-3 ml-1 transition-transform hidden sm:block" />
                        </Button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>{currentPreset.name}</p>
                    </TooltipContent>
                  </Tooltip>
                  <PopoverContent
                    side="left"
                    align="start"
                    className={cn(
                      "w-auto min-w-[140px] p-1",
                      isLightMode
                        ? "bg-white/95 border-zinc-200"
                        : "bg-zinc-900/95 border-zinc-700 backdrop-blur-sm"
                    )}
                  >
                    <div className="flex flex-col">
                      {presets.map((preset) => (
                        <Button
                          key={preset.id}
                          variant="ghost"
                          onClick={() => setPreset(preset.id)}
                          className={cn(
                            "w-full justify-start h-auto py-2 px-3 rounded-md text-sm font-normal",
                            currentPreset.id === preset.id
                              ? isLightMode
                                ? "bg-zinc-100 text-zinc-900"
                                : "bg-zinc-800 text-white"
                              : isLightMode
                                ? "text-zinc-600 hover:bg-zinc-50"
                                : "text-zinc-400 hover:bg-zinc-800"
                          )}
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Divider */}
                <div className={cn(
                  "block h-full w-px sm:w-full sm:h-px",
                  isLightMode ? "bg-zinc-200" : "bg-white/10"
                )} />

                {/* Volume Control */}
                <div className="flex flex-1 items-center gap-1.5 sm:flex-col flex-1 p-2 ">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setVolume(volume > 0 ? 0 : 75)}
                        className={cn(
                          "h-9 w-9 shrink-0",
                          volume > 0
                            ? isLightMode
                              ? "text-zinc-600 hover:bg-zinc-200/50"
                              : "text-zinc-300 hover:bg-white/5"
                            : isLightMode
                              ? "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                              : "bg-white/10 text-white hover:bg-white/20"
                        )}
                      >
                        {volume > 0 ? (
                          <Volume2 className="h-4 w-4" />
                        ) : (
                          <VolumeX className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>{volume > 0 ? `${volume}%` : "Muted"}</p>
                    </TooltipContent>
                  </Tooltip>

                  <Slider
                    value={[volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    min={0}
                    max={100}
                    step={1}
                    orientation="horizontal"
                    className="flex-1 min-w-12 sm:hidden"
                  />

                  <Slider
                    value={[volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    min={0}
                    max={100}
                    step={1}
                    orientation="vertical"
                    className="hidden sm:flex sm:flex-1 sm:min-h-24"
                  />

                  <span className={cn(
                    "text-[10px] font-mono tabular-nums shrink-0",
                    isLightMode ? "text-zinc-400" : "text-zinc-500"
                  )}>
                    {volume}
                  </span>
                </div>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Subtle reflection/glow under the device */}
      <div
        className={cn(
          "absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full blur-2xl transition-opacity",
          isLightMode ? "opacity-20" : "opacity-30"
        )}
        style={{ backgroundColor: theme.secondary }}
      />
    </div>
  );
}
