"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Sound, MoodTheme } from "./types";
import { Loader2 } from "lucide-react";

type SoundButtonProps = {
  sound: Sound;
  fade?: boolean;
  loop?: boolean;
  volume: number;
  theme?: MoodTheme;
  isLightMode?: boolean;
  hotkey?: string;
  triggerRef?: React.MutableRefObject<(() => void) | null>;
  className?: string;
};

const FADE_RATE = 0.025;
const FADE_INTERVAL_MS = 50;

export function SoundButton({
  sound,
  fade = false,
  loop = false,
  volume,
  theme,
  isLightMode = false,
  hotkey,
  triggerRef,
  className,
}: SoundButtonProps) {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const Icon = sound.icon;

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio(sound.audioSrc);
    audio.preload = "metadata";
    audioRef.current = audio;

    const handleEnded = () => {
      setIsActive(false);
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
      setIsActive(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setHasError(false);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplaythrough", handleCanPlay);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplaythrough", handleCanPlay);
      
      // Clear any pending fade interval
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      
      audio.pause();
      audio.src = "";
    };
  }, [sound.audioSrc]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current && isActive) {
      audioRef.current.volume = volume;
    }
  }, [volume, isActive]);

  const fadeOut = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    fadeIntervalRef.current = setInterval(() => {
      if (audio.volume <= FADE_RATE) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }
        audio.pause();
        audio.currentTime = 0;
        audio.volume = volume;
        setIsActive(false);
      } else {
        audio.volume = Math.max(0, audio.volume - FADE_RATE);
      }
    }, FADE_INTERVAL_MS);
  }, [volume]);

  const fadeIn = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0;
    audio.loop = loop;
    
    setIsLoading(true);
    audio.play().then(() => {
      setIsLoading(false);
      
      fadeIntervalRef.current = setInterval(() => {
        if (audio.volume >= volume - FADE_RATE) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
          audio.volume = volume;
        } else {
          audio.volume = Math.min(1, audio.volume + FADE_RATE);
        }
      }, FADE_INTERVAL_MS);
    }).catch(() => {
      setHasError(true);
      setIsLoading(false);
      setIsActive(false);
    });
  }, [loop, volume]);

  const toggleSound = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    // Clear any existing fade interval
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    if (isActive) {
      if (fade) {
        fadeOut();
      } else {
        audio.pause();
        audio.currentTime = 0;
        setIsActive(false);
      }
    } else {
      setIsActive(true);
      if (fade) {
        fadeIn();
      } else {
        audio.volume = volume;
        audio.loop = loop;
        setIsLoading(true);
        audio.play().then(() => {
          setIsLoading(false);
        }).catch(() => {
          setHasError(true);
          setIsLoading(false);
          setIsActive(false);
        });
      }
    }
  }, [isActive, fade, fadeIn, fadeOut, loop, volume, hasError]);

  // Expose toggle function to parent via ref
  useEffect(() => {
    if (triggerRef) {
      triggerRef.current = toggleSound;
    }
    return () => {
      if (triggerRef) {
        triggerRef.current = null;
      }
    };
  }, [triggerRef, toggleSound]);

  // Keycap-style button with glow effect
  const glowColor = theme?.secondary ?? "#3b82f6";
  const accentColor = theme?.primary ?? "#3b82f6";
  
  const buttonStyle: React.CSSProperties = isActive
    ? {
        boxShadow: isLightMode
          ? `0 0 16px ${glowColor}50, 0 0 32px ${glowColor}25, 0 4px 8px rgba(0,0,0,0.1)`
          : `0 0 20px ${glowColor}60, 0 0 40px ${glowColor}30, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
        borderColor: glowColor,
        background: `linear-gradient(180deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
      }
    : {
        "--glow-color": glowColor,
        "--accent-color": accentColor,
      } as React.CSSProperties;

  return (
    <button
      onClick={toggleSound}
      disabled={hasError}
      title={hasError ? "Audio file not found" : sound.name}
      className={cn(
        // Base keycap styling
        "relative flex items-center justify-center overflow-hidden",
        "rounded-xl border-2 transition-all duration-200",
        "font-medium select-none cursor-pointer",
        // Size variants
        loop
          ? "aspect-square min-h-16 sm:min-h-20 md:min-h-24 flex-col gap-2 p-3 text-xs sm:text-sm"
          : "h-16 px-4 sm:h-20 sm:px-6 flex-row gap-2 text-xs sm:text-sm",
        // Inactive state - light mode
        !isActive && isLightMode && [
          "border-zinc-200 bg-gradient-to-b from-white to-zinc-50",
          "text-zinc-500",
          "shadow-[0_2px_4px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]",
          "hover:border-[var(--glow-color,#3b82f6)] hover:text-zinc-700",
          "hover:shadow-[0_0_12px_var(--glow-color,#3b82f6)20,0_2px_4px_rgba(0,0,0,0.05)]",
          "active:translate-y-[1px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]",
        ],
        // Inactive state - dark mode (default)
        !isActive && !isLightMode && [
          "border-[#27272a] bg-gradient-to-b from-[#18181b] to-[#0f0f11]",
          "text-zinc-400",
          "shadow-[inset_0_-2px_4px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)]",
          "hover:border-[var(--glow-color,#3b82f6)] hover:text-zinc-200",
          "hover:shadow-[0_0_12px_var(--glow-color,#3b82f6)30,inset_0_-2px_4px_rgba(0,0,0,0.4)]",
          "active:translate-y-[1px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]",
        ],
        // Active state - lit up RGB glow
        isActive && [
          "text-white",
          "border-2",
          "scale-[0.98]",
        ],
        // Disabled/error state
        hasError && "opacity-40 cursor-not-allowed grayscale",
        className
      )}
      style={buttonStyle}
    >
      {/* Subtle inner highlight for depth */}
      <span
        className={cn(
          "absolute inset-0 rounded-[10px] pointer-events-none",
          isLightMode
            ? "bg-gradient-to-b from-white/50 to-transparent"
            : "bg-gradient-to-b from-white/5 to-transparent",
          isActive && (isLightMode ? "from-white/30" : "from-white/10")
        )}
      />

      {/* Icon and label */}
      <span className="relative z-10 flex items-center justify-center flex-col gap-2">
        {isLoading ? (
          <Loader2
            className={cn(
              "animate-spin",
              loop ? "h-8 w-8 sm:h-10 sm:w-10" : "h-4 w-4 sm:h-5 sm:w-5"
            )}
          />
        ) : Icon ? (
          <Icon
            className={cn(
              loop ? "h-8 w-8 sm:h-10 sm:w-10" : "h-4 w-4 sm:h-5 sm:w-5",
              isActive && "drop-shadow-[0_0_8px_currentColor]"
            )}
          />
        ) : null}
        <span className={cn("truncate", loop && "max-w-full")}>{sound.name}</span>
      </span>

      {/* RGB glow indicator for active state */}
      {isActive && (
        <span
          className="absolute inset-0 rounded-xl pointer-events-none animate-pulse"
          style={{
            background: `radial-gradient(ellipse at center, ${glowColor}${isLightMode ? "15" : "20"} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Hotkey indicator */}
      {hotkey && (
        <span
          className={cn(
            "absolute top-1.5 right-1.5 sm:top-2 sm:right-2",
            "flex items-center justify-center",
            "w-4 h-4 sm:w-5 sm:h-5 rounded text-[10px] sm:text-xs font-bold uppercase",
            "transition-all pointer-events-none",
            isActive
              ? "bg-white/20 text-white/90"
              : isLightMode
                ? "bg-zinc-200/80 text-zinc-400"
                : "bg-zinc-800/80 text-zinc-500"
          )}
        >
          {hotkey}
        </span>
      )}
    </button>
  );
}
