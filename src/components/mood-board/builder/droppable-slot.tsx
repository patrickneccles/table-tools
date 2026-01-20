"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { SoundDefinition } from "./types";
import { MoodTheme } from "../types";
import { X, Plus } from "lucide-react";

type DroppableSlotProps = {
  id: string;
  slotType: "ambience" | "effect";
  slotIndex: number;
  sound: SoundDefinition | null;
  theme: MoodTheme;
  isLightMode?: boolean;
  onRemove?: () => void;
};

export function DroppableSlot({
  id,
  slotType,
  slotIndex,
  sound,
  theme,
  isLightMode = false,
  onRemove,
}: DroppableSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { slotType, slotIndex },
  });

  const Icon = sound?.icon;
  const isAmbience = slotType === "ambience";

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        "rounded-xl border-2 border-dashed transition-all duration-200",
        "font-medium select-none",
        // Size variants
        isAmbience
          ? "aspect-square min-h-16 sm:min-h-20 md:min-h-24 flex-col gap-2 p-3 text-xs sm:text-sm"
          : "h-16 px-4 sm:h-20 sm:px-6 flex-row gap-2 text-xs sm:text-sm",
        // Empty slot styling
        !sound && [
          isLightMode
            ? "border-zinc-300 bg-zinc-100/50"
            : "border-zinc-700 bg-zinc-900/50",
          isOver && "border-solid",
        ],
        // Filled slot styling
        sound && [
          "border-solid cursor-pointer group",
          isLightMode
            ? "border-zinc-200 bg-gradient-to-b from-white to-zinc-50 hover:border-zinc-300"
            : "border-zinc-700 bg-gradient-to-b from-zinc-800 to-zinc-900 hover:border-zinc-600",
        ],
        // Drag over state
        isOver && "scale-105"
      )}
      style={
        isOver
          ? {
              borderColor: theme.secondary,
              boxShadow: `0 0 20px ${theme.secondary}40`,
            }
          : undefined
      }
    >
      {sound ? (
        <>
          {/* Sound content */}
          <div className="relative z-10 flex items-center justify-center flex-col gap-2">
            {Icon && (
              <Icon
                className={cn(
                  isAmbience ? "h-6 w-6 sm:h-8 sm:w-8" : "h-4 w-4 sm:h-5 sm:w-5",
                  isLightMode ? "text-zinc-600" : "text-zinc-400"
                )}
              />
            )}
            <span
              className={cn(
                "truncate text-center",
                isLightMode ? "text-zinc-700" : "text-zinc-300"
              )}
            >
              {sound.name}
            </span>
          </div>

          {/* Remove button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className={cn(
              "absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100",
              "transition-opacity",
              isLightMode
                ? "bg-zinc-200 hover:bg-zinc-300 text-zinc-600"
                : "bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
            )}
          >
            <X className="h-3 w-3" />
          </button>
        </>
      ) : (
        <>
          {/* Empty slot placeholder */}
          <Plus
            className={cn(
              "h-6 w-6",
              isLightMode ? "text-zinc-400" : "text-zinc-600",
              isOver && "text-current"
            )}
            style={isOver ? { color: theme.secondary } : undefined}
          />
          <span
            className={cn(
              "text-xs",
              isLightMode ? "text-zinc-400" : "text-zinc-600",
              isAmbience && "absolute bottom-2"
            )}
          >
            {isAmbience ? `Ambience ${slotIndex + 1}` : `Effect ${slotIndex + 1}`}
          </span>
        </>
      )}
    </div>
  );
}
