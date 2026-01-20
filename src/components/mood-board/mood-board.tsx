"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Volume2, VolumeX } from "lucide-react";
import { Mood, MoodTheme } from "./types";
import { SoundButton } from "./sound-button";
import { cn } from "@/lib/utils";

// Hotkey mapping: QWER for row 1 (Ambience 1-4), ASDF for row 2 (Ambience 5-8), ZXCV for row 3 (Effects 1-4)
const HOTKEY_MAP: Record<string, { type: "ambience" | "effect"; index: number }> = {
  q: { type: "ambience", index: 0 },
  w: { type: "ambience", index: 1 },
  e: { type: "ambience", index: 2 },
  r: { type: "ambience", index: 3 },
  a: { type: "ambience", index: 4 },
  s: { type: "ambience", index: 5 },
  d: { type: "ambience", index: 6 },
  f: { type: "ambience", index: 7 },
  z: { type: "effect", index: 0 },
  x: { type: "effect", index: 1 },
  c: { type: "effect", index: 2 },
  v: { type: "effect", index: 3 },
};

// Get hotkey for a given type and index
function getHotkey(type: "ambience" | "effect", index: number): string | undefined {
  for (const [key, mapping] of Object.entries(HOTKEY_MAP)) {
    if (mapping.type === type && mapping.index === index) {
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
};

export function MoodBoard({ mood, isLightMode = false }: MoodBoardProps) {
  const [volume, setVolume] = useState(75);
  const [fade, setFade] = useState(true);

  // Create stable refs for all possible slots (8 ambience + 4 effects)
  const ambienceRef0 = useRef<(() => void) | null>(null);
  const ambienceRef1 = useRef<(() => void) | null>(null);
  const ambienceRef2 = useRef<(() => void) | null>(null);
  const ambienceRef3 = useRef<(() => void) | null>(null);
  const ambienceRef4 = useRef<(() => void) | null>(null);
  const ambienceRef5 = useRef<(() => void) | null>(null);
  const ambienceRef6 = useRef<(() => void) | null>(null);
  const ambienceRef7 = useRef<(() => void) | null>(null);
  const effectRef0 = useRef<(() => void) | null>(null);
  const effectRef1 = useRef<(() => void) | null>(null);
  const effectRef2 = useRef<(() => void) | null>(null);
  const effectRef3 = useRef<(() => void) | null>(null);

  const ambienceRefs = [
    ambienceRef0, ambienceRef1, ambienceRef2, ambienceRef3,
    ambienceRef4, ambienceRef5, ambienceRef6, ambienceRef7,
  ];
  const effectRefs = [effectRef0, effectRef1, effectRef2, effectRef3];

  const audioVolume = volume / 100;
  const theme = mood.theme ?? defaultTheme;

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
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
    const mapping = HOTKEY_MAP[key];

    if (mapping) {
      event.preventDefault();
      
      if (mapping.type === "ambience") {
        const trigger = ambienceRefs[mapping.index]?.current;
        if (trigger) trigger();
      } else {
        const trigger = effectRefs[mapping.index]?.current;
        if (trigger) trigger();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Refs are stable, arrays are just wrappers

  // Attach keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="relative">
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
          <div className="flex flex-col gap-6 sm:flex-row-reverse sm:justify-between">
            {/* Controls Panel - styled like device controls */}
            <div className="flex flex-row items-center justify-between gap-6 sm:flex-col sm:items-end sm:justify-start">
              {/* Fade Toggle */}
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isLightMode
                    ? "bg-zinc-100 border border-zinc-200"
                    : "bg-black/40 border border-white/5"
                )}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="fade-toggle"
                          className={cn(
                            "text-xs font-medium uppercase tracking-wider transition-colors",
                            isLightMode ? "text-zinc-500" : "text-zinc-400"
                          )}
                        >
                          Fade
                        </Label>
                        <Switch
                          id="fade-toggle"
                          checked={fade}
                          onCheckedChange={setFade}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Smoothly fade sounds in and out</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Volume Control */}
              <div
                className={cn(
                  "flex flex-1 items-center gap-3 px-3 py-3 rounded-lg sm:h-52 sm:flex-col transition-colors",
                  isLightMode
                    ? "bg-zinc-100 border border-zinc-200"
                    : "bg-black/40 border border-white/5"
                )}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Volume2
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isLightMode ? "text-zinc-400" : "text-zinc-500"
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Volume: {volume}%</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Slider
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  orientation="horizontal"
                  className="w-24 sm:hidden"
                />

                <Slider
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  orientation="vertical"
                  className="hidden h-full sm:flex"
                />

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <VolumeX
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isLightMode ? "text-zinc-400" : "text-zinc-500"
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Muted</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Sound Buttons - the keycap grid */}
            <div className="flex flex-1 flex-col gap-6">
              {/* Ambience Section */}
              {mood.ambience.length > 0 && (
                <div className="space-y-3">
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
                          fade={fade}
                          loop
                          volume={audioVolume}
                          theme={theme}
                          isLightMode={isLightMode}
                          hotkey={getHotkey("ambience", index)}
                          triggerRef={ambienceRefs[index]}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Effects Section */}
              {mood.effects.length > 0 && (
                <div className="space-y-3">
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
                          hotkey={getHotkey("effect", index)}
                          triggerRef={effectRefs[index]}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
