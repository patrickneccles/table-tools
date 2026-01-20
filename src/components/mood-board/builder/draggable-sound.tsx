"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { SoundDefinition } from "./types";
import { Check } from "lucide-react";

type DraggableSoundProps = {
  sound: SoundDefinition;
  isLightMode?: boolean;
  isPlaced?: boolean; // Whether this sound is already on the board
};

export function DraggableSoundItem({ 
  sound, 
  isLightMode = false,
  isPlaced = false,
}: DraggableSoundProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: sound.id,
    data: { sound },
  });

  const Icon = sound.icon;

  // Don't apply transform - let DragOverlay handle the visual during drag
  // This prevents the side-scrolling issue
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
        "border select-none",
        // Dragging state - show placeholder
        isDragging && "opacity-30",
        // Placed state - show "in use" indicator
        isPlaced && !isDragging && [
          isLightMode
            ? "bg-emerald-50 border-emerald-200 cursor-default"
            : "bg-emerald-950/30 border-emerald-800/50 cursor-default",
        ],
        // Normal state - draggable
        !isPlaced && !isDragging && [
          "cursor-grab active:cursor-grabbing",
          isLightMode
            ? "bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
            : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800",
        ]
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 flex-shrink-0",
          isPlaced
            ? isLightMode ? "text-emerald-600" : "text-emerald-400"
            : isLightMode ? "text-zinc-500" : "text-zinc-400"
        )}
      />
      <span
        className={cn(
          "text-xs font-medium truncate flex-1",
          isPlaced
            ? isLightMode ? "text-emerald-700" : "text-emerald-300"
            : isLightMode ? "text-zinc-700" : "text-zinc-300"
        )}
      >
        {sound.name}
      </span>
      {isPlaced && (
        <Check
          className={cn(
            "h-3 w-3 flex-shrink-0",
            isLightMode ? "text-emerald-500" : "text-emerald-400"
          )}
        />
      )}
    </div>
  );
}
