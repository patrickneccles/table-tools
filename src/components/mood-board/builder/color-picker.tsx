"use client";

import React from "react";
import { cn } from "@/lib/utils";

type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isLightMode?: boolean;
};

// Preset colors for quick selection
const PRESET_COLORS = [
  // Reds/Oranges
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  // Greens
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4",
  // Blues
  "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6",
  // Purples/Pinks
  "#a855f7", "#d946ef", "#ec4899", "#f43f5e",
];

export function ColorPicker({ label, value, onChange, isLightMode = false }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label
        className={cn(
          "text-xs font-medium uppercase tracking-wide",
          isLightMode ? "text-zinc-500" : "text-zinc-400"
        )}
      >
        {label}
      </label>
      
      <div className="flex items-center gap-2">
        {/* Native color input */}
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className={cn(
              "w-10 h-10 rounded-lg border-2 cursor-pointer transition-all",
              "hover:scale-105",
              isLightMode ? "border-zinc-300" : "border-zinc-600"
            )}
            style={{ backgroundColor: value }}
          />
        </div>

        {/* Hex input */}
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const hex = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(hex)) {
              onChange(hex);
            }
          }}
          className={cn(
            "w-24 px-2 py-1.5 rounded-md text-sm font-mono",
            isLightMode
              ? "bg-zinc-100 text-zinc-700 border border-zinc-200"
              : "bg-zinc-800 text-zinc-300 border border-zinc-700"
          )}
        />
      </div>

      {/* Preset colors */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={cn(
              "w-6 h-6 rounded-md border transition-all",
              "hover:scale-110",
              value === color
                ? "ring-2 ring-offset-1"
                : isLightMode
                  ? "border-zinc-300"
                  : "border-zinc-600"
            )}
            style={{
              backgroundColor: color,
              ringColor: color,
            }}
          />
        ))}
      </div>
    </div>
  );
}
