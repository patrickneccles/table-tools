"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  pointerWithin,
} from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import {
  BoardConfig,
  createDefaultBoardConfig,
  DEFAULT_SLOT_CONFIG,
  SoundDefinition,
  SlotConfig,
  LAYOUT_PRESETS,
  LayoutPreset,
} from "./types";
import { getSoundById } from "./sound-registry";
import { SoundPalette } from "./sound-palette";
import { DroppableSlot } from "./droppable-slot";
import { ColorPicker } from "./color-picker";
import { Save, RotateCcw, Download, Upload, Play, Pencil, Volume2 } from "lucide-react";
import { audioManager } from "@/lib/audio-manager";
import { Button } from "@/components/ui/button";

type BoardBuilderProps = {
  isLightMode?: boolean;
  initialConfig?: BoardConfig;
  onSave?: (config: BoardConfig) => void;
};

export function BoardBuilder({
  isLightMode = false,
  initialConfig,
  onSave,
}: BoardBuilderProps) {
  const [slotConfig, setSlotConfig] = useState<SlotConfig>(DEFAULT_SLOT_CONFIG);
  const [config, setConfig] = useState<BoardConfig>(
    initialConfig ?? createDefaultBoardConfig(DEFAULT_SLOT_CONFIG)
  );
  const [activeSound, setActiveSound] = useState<SoundDefinition | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewVolume, setPreviewVolume] = useState(0.75);

  // Preload sounds that are placed on the board (for live preview)
  useEffect(() => {
    const soundIds = [...config.ambienceSlots, ...config.effectSlots].filter(Boolean) as string[];
    const urls = soundIds
      .map((id) => getSoundById(id)?.audioSrc)
      .filter(Boolean) as string[];
    
    if (urls.length > 0) {
      audioManager.preloadAll(urls);
    }
  }, [config.ambienceSlots, config.effectSlots]);

  // Toggle preview mode and stop all sounds when exiting
  const handleTogglePreviewMode = useCallback(async () => {
    if (isPreviewMode) {
      await audioManager.stopAll({ fadeOut: true });
    }
    setIsPreviewMode((prev) => !prev);
  }, [isPreviewMode]);

  // Handle layout preset change
  const handleLayoutChange = useCallback((preset: LayoutPreset) => {
    setSlotConfig(preset.config);
    // Resize the slot arrays to match the new configuration
    setConfig((prev) => {
      const newAmbienceSlots = Array(preset.config.ambienceCount).fill(null).map(
        (_, i) => prev.ambienceSlots[i] ?? null
      );
      const newEffectSlots = Array(preset.config.effectCount).fill(null).map(
        (_, i) => prev.effectSlots[i] ?? null
      );
      return {
        ...prev,
        ambienceSlots: newAmbienceSlots,
        effectSlots: newEffectSlots,
        updatedAt: new Date().toISOString(),
      };
    });
    setIsDirty(true);
  }, []);

  // Compute which sounds are currently placed on the board
  const placedSoundIds = useMemo(() => {
    const ids = new Set<string>();
    config.ambienceSlots.forEach((id) => {
      if (id) ids.add(id);
    });
    config.effectSlots.forEach((id) => {
      if (id) ids.add(id);
    });
    return ids;
  }, [config.ambienceSlots, config.effectSlots]);

  const updateConfig = useCallback((updates: Partial<BoardConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
    setIsDirty(true);
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const sound = event.active.data.current?.sound as SoundDefinition | undefined;
    if (sound) {
      setActiveSound(sound);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveSound(null);
      const { over, active } = event;

      if (!over) return;

      const sound = active.data.current?.sound as SoundDefinition | undefined;
      const dropData = over.data.current as
        | { slotType: "ambience" | "effect"; slotIndex: number }
        | undefined;

      if (!sound || !dropData) return;

      const { slotType, slotIndex } = dropData;

      // Validate slot type matches sound category
      if (
        (slotType === "ambience" && sound.category !== "ambience") ||
        (slotType === "effect" && sound.category !== "effect")
      ) {
        return; // Don't allow dropping wrong category
      }

      // Update the appropriate slot
      if (slotType === "ambience") {
        const newSlots = [...config.ambienceSlots];
        newSlots[slotIndex] = sound.id;
        updateConfig({ ambienceSlots: newSlots });
      } else {
        const newSlots = [...config.effectSlots];
        newSlots[slotIndex] = sound.id;
        updateConfig({ effectSlots: newSlots });
      }
    },
    [config, updateConfig]
  );

  const removeFromSlot = useCallback(
    (slotType: "ambience" | "effect", slotIndex: number) => {
      if (slotType === "ambience") {
        const newSlots = [...config.ambienceSlots];
        newSlots[slotIndex] = null;
        updateConfig({ ambienceSlots: newSlots });
      } else {
        const newSlots = [...config.effectSlots];
        newSlots[slotIndex] = null;
        updateConfig({ effectSlots: newSlots });
      }
    },
    [config, updateConfig]
  );

  const handleSave = useCallback(() => {
    onSave?.(config);
    setIsDirty(false);
    // For now, just log to console
    console.log("Saved config:", config);
  }, [config, onSave]);

  const handleReset = useCallback(() => {
    setConfig(createDefaultBoardConfig(slotConfig));
    setIsDirty(false);
  }, [slotConfig]);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(config, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${config.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [config]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target?.result as string) as BoardConfig;
            setConfig(imported);
            setIsDirty(true);
          } catch (err) {
            console.error("Failed to import config:", err);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={pointerWithin}
    >
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Left Panel - Sound Palette */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <SoundPalette isLightMode={isLightMode} placedSoundIds={placedSoundIds} />
        </div>

        {/* Main Content - Board Preview & Settings */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Board Metadata */}
          <div
            className={cn(
              "rounded-xl border p-4",
              isLightMode
                ? "bg-white border-zinc-200"
                : "bg-zinc-900 border-zinc-800"
            )}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name & Description */}
              <div className="space-y-3">
                <div>
                  <label
                    className={cn(
                      "text-xs font-medium uppercase tracking-wide block mb-1",
                      isLightMode ? "text-zinc-500" : "text-zinc-400"
                    )}
                  >
                    Board Name
                  </label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => updateConfig({ name: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg text-sm",
                      isLightMode
                        ? "bg-zinc-100 text-zinc-700 border border-zinc-200"
                        : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                    )}
                  />
                </div>
                <div>
                  <label
                    className={cn(
                      "text-xs font-medium uppercase tracking-wide block mb-1",
                      isLightMode ? "text-zinc-500" : "text-zinc-400"
                    )}
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    value={config.description ?? ""}
                    onChange={(e) => updateConfig({ description: e.target.value })}
                    placeholder="Optional description..."
                    className={cn(
                      "w-full px-3 py-2 rounded-lg text-sm",
                      isLightMode
                        ? "bg-zinc-100 text-zinc-700 border border-zinc-200 placeholder:text-zinc-400"
                        : "bg-zinc-800 text-zinc-300 border border-zinc-700 placeholder:text-zinc-500"
                    )}
                  />
                </div>
                {/* Layout Preset Selector */}
                <div>
                  <label
                    className={cn(
                      "text-xs font-medium uppercase tracking-wide block mb-1",
                      isLightMode ? "text-zinc-500" : "text-zinc-400"
                    )}
                  >
                    Layout
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LAYOUT_PRESETS.map((preset) => {
                      const isSelected =
                        slotConfig.ambienceCount === preset.config.ambienceCount &&
                        slotConfig.effectCount === preset.config.effectCount;
                      return (
                        <Button
                          key={preset.id}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleLayoutChange(preset)}
                          className={cn(
                            "text-xs",
                            isSelected
                              ? isLightMode
                                ? "bg-zinc-800 text-white hover:bg-zinc-700"
                                : "bg-white text-zinc-900 hover:bg-zinc-100"
                              : isLightMode
                                ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border-zinc-200"
                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border-zinc-700"
                          )}
                          title={preset.description}
                        >
                          {preset.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Theme Colors */}
              <div className="grid grid-cols-2 gap-4">
                <ColorPicker
                  label="Primary Color"
                  value={config.theme.primary}
                  onChange={(primary) =>
                    updateConfig({ theme: { ...config.theme, primary } })
                  }
                  isLightMode={isLightMode}
                />
                <ColorPicker
                  label="Glow Color"
                  value={config.theme.secondary}
                  onChange={(secondary) =>
                    updateConfig({ theme: { ...config.theme, secondary } })
                  }
                  isLightMode={isLightMode}
                />
              </div>
            </div>
          </div>

          {/* Board Preview */}
          <div
            className={cn(
              "flex-1 rounded-xl border overflow-hidden",
              isLightMode
                ? "bg-zinc-100 border-zinc-200"
                : "bg-zinc-900 border-zinc-800"
            )}
          >
            {/* Preview Header */}
            <div
              className={cn(
                "px-4 py-3 border-b flex items-center justify-between",
                isLightMode ? "border-zinc-200" : "border-zinc-800"
              )}
            >
              <h3
                className={cn(
                  "text-sm font-semibold flex items-center gap-2",
                  isLightMode ? "text-zinc-700" : "text-zinc-300"
                )}
              >
                {isPreviewMode ? (
                  <>
                    <Play className="h-4 w-4 text-green-500" />
                    Live Preview
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4" />
                    Edit Mode
                  </>
                )}
              </h3>
              <div className="flex items-center gap-3">
                {/* Preview Volume */}
                {isPreviewMode && (
                  <div className="flex items-center gap-2">
                    <Volume2 className={cn("h-4 w-4", isLightMode ? "text-zinc-500" : "text-zinc-400")} />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={previewVolume}
                      onChange={(e) => {
                        const vol = parseFloat(e.target.value);
                        setPreviewVolume(vol);
                        audioManager.setMasterVolume(vol);
                      }}
                      className="w-20 h-1 accent-blue-500"
                    />
                  </div>
                )}
                
                {isDirty && !isPreviewMode && (
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      isLightMode
                        ? "bg-amber-100 text-amber-700"
                        : "bg-amber-900/50 text-amber-400"
                    )}
                  >
                    Unsaved changes
                  </span>
                )}
                
                {/* Preview Mode Toggle */}
                <Button
                  variant={isPreviewMode ? "default" : "outline"}
                  size="sm"
                  onClick={handleTogglePreviewMode}
                  className={cn(
                    "text-xs",
                    isPreviewMode
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : isLightMode
                        ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  )}
                >
                  {isPreviewMode ? (
                    <>
                      <Pencil className="h-3 w-3" />
                      Edit
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      Preview
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Board Slots - order depends on effectsFirst setting */}
            <div className="p-4 space-y-6">
              {/* Render sections in correct order */}
              {(slotConfig.effectsFirst ? ["effects", "ambience"] : ["ambience", "effects"]).map((section) =>
                section === "ambience" ? (
                  <div key="ambience" className="space-y-3">
                    <h4
                      className="text-xs font-semibold uppercase tracking-widest px-1"
                      style={{ color: config.theme.secondary }}
                    >
                      Ambience (drag sounds here)
                    </h4>
                    <div
                      className={cn(
                        "rounded-xl p-3",
                        isLightMode
                          ? "bg-white border border-zinc-200"
                          : "bg-black/30 border border-zinc-800"
                      )}
                    >
                      <div
                        className="grid gap-2 md:gap-4"
                        style={{
                          gridTemplateColumns: `repeat(${slotConfig.ambienceColumns}, minmax(0, 1fr))`,
                        }}
                      >
                        {config.ambienceSlots.map((soundId, index) => (
                          <DroppableSlot
                            key={`ambience-${index}`}
                            id={`ambience-${index}`}
                            slotType="ambience"
                            slotIndex={index}
                            sound={soundId ? getSoundById(soundId) ?? null : null}
                            theme={config.theme}
                            isLightMode={isLightMode}
                            rectangularAmbience={slotConfig.rectangularAmbience}
                            isPreviewMode={isPreviewMode}
                            previewVolume={previewVolume}
                            onRemove={() => removeFromSlot("ambience", index)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key="effects" className="space-y-3">
                    <h4
                      className="text-xs font-semibold uppercase tracking-widest px-1"
                      style={{ color: config.theme.secondary }}
                    >
                      Effects (drag sounds here)
                    </h4>
                    <div
                      className={cn(
                        "rounded-xl p-3",
                        isLightMode
                          ? "bg-white border border-zinc-200"
                          : "bg-black/30 border border-zinc-800"
                      )}
                    >
                      <div
                        className="grid gap-2 md:gap-4"
                        style={{
                          gridTemplateColumns: `repeat(${slotConfig.effectColumns}, minmax(0, 1fr))`,
                        }}
                      >
                        {config.effectSlots.map((soundId, index) => (
                          <DroppableSlot
                            key={`effect-${index}`}
                            id={`effect-${index}`}
                            slotType="effect"
                            slotIndex={index}
                            sound={soundId ? getSoundById(soundId) ?? null : null}
                            theme={config.theme}
                            isLightMode={isLightMode}
                            squareEffects={slotConfig.squareEffects}
                            isPreviewMode={isPreviewMode}
                            previewVolume={previewVolume}
                            onRemove={() => removeFromSlot("effect", index)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4" />
              Save Board
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              className={cn(
                isLightMode
                  ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              )}
            >
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
            <Button
              variant="outline"
              onClick={handleImport}
              className={cn(
                isLightMode
                  ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              )}
            >
              <Upload className="h-4 w-4" />
              Import JSON
            </Button>
            <Button
              variant="ghost"
              onClick={handleReset}
              className={cn(
                isLightMode
                  ? "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
              )}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeSound && (
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg",
              "border shadow-xl",
              isLightMode
                ? "bg-white border-zinc-200"
                : "bg-zinc-800 border-zinc-600"
            )}
          >
            <activeSound.icon
              className={cn(
                "h-4 w-4",
                isLightMode ? "text-zinc-600" : "text-zinc-300"
              )}
            />
            <span
              className={cn(
                "text-xs font-medium",
                isLightMode ? "text-zinc-700" : "text-zinc-200"
              )}
            >
              {activeSound.name}
            </span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
