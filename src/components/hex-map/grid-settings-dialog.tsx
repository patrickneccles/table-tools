"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NEUTRAL_COLORS, PALETTES } from "./constants/palette";
import { useHexMapSettings } from "./settings-context";

type Orientation = "flat" | "pointy";

export function HexMapGridSettingsDialog({
  open,
  onOpenChange,
  onSaveComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveComplete: () => void;
}) {
  const {
    width,
    setWidth,
    height,
    setHeight,
    stroke,
    setStroke,
    strokeWidth,
    setStrokeWidth,
    spacing,
    setSpacing,
    orientation,
    setOrientation,
    baseFill,
    setBaseFill,
    palette,
    setPalette,
  } = useHexMapSettings();

  const [pendingPalette, setPendingPalette] = useState(palette);
  const [pendingWidth, setPendingWidth] = useState(width);
  const [pendingHeight, setPendingHeight] = useState(height);
  const [pendingStroke, setPendingStroke] = useState(stroke);
  const [pendingStrokeWidth, setPendingStrokeWidth] = useState(strokeWidth);
  const [pendingSpacing, setPendingSpacing] = useState(spacing);
  const [pendingFill, setPendingFill] = useState(baseFill);
  const [pendingOrientation, setPendingOrientation] =
    useState<Orientation>(orientation);

  useEffect(() => {
    if (!open) return;
    setPendingPalette(palette);
    setPendingWidth(width);
    setPendingHeight(height);
    setPendingStroke(stroke);
    setPendingStrokeWidth(strokeWidth);
    setPendingSpacing(spacing);
    setPendingFill(baseFill);
    setPendingOrientation(orientation);
  }, [
    open,
    palette,
    width,
    height,
    stroke,
    strokeWidth,
    spacing,
    baseFill,
    orientation,
  ]);

  const handleSave = () => {
    setHeight(pendingHeight);
    setWidth(pendingWidth);
    setOrientation(pendingOrientation);
    setPalette(pendingPalette);
    setBaseFill(pendingFill);
    setSpacing(pendingSpacing);
    setStroke(pendingStroke);
    setStrokeWidth(pendingStrokeWidth);
    onSaveComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Grid settings</DialogTitle>
          <DialogDescription>
            Map size, orientation, palette, and default stroke for new hexes.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="settings-width">Width</Label>
            <Input
              id="settings-width"
              type="number"
              min={1}
              max={30}
              value={pendingWidth}
              onChange={(e) => setPendingWidth(Number(e.target.value))}
              className="w-24"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-height">Height</Label>
            <Input
              id="settings-height"
              type="number"
              min={1}
              max={30}
              value={pendingHeight}
              onChange={(e) => setPendingHeight(Number(e.target.value))}
              className="w-24"
            />
          </div>
          <div className="space-y-2">
            <Label>Orientation</Label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="orientation"
                  checked={pendingOrientation === "flat"}
                  onChange={() => setPendingOrientation("flat")}
                />
                Flat-topped
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="orientation"
                  checked={pendingOrientation === "pointy"}
                  onChange={() => setPendingOrientation("pointy")}
                />
                Pointy-topped
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="palette-select">Palette</Label>
            <select
              id="palette-select"
              className="flex h-9 w-full max-w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
              value={pendingPalette}
              onChange={(e) =>
                setPendingPalette(e.target.value as keyof typeof PALETTES)
              }
            >
              {Object.keys(PALETTES).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Base fill</Label>
            <div className="flex flex-row flex-wrap gap-2">
              {(PALETTES[pendingPalette] as string[]).map((color: string) => (
                <Button
                  key={color}
                  type="button"
                  variant={pendingFill === color ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8 rounded-full p-0"
                  style={{
                    backgroundColor: color,
                    borderColor: pendingStroke,
                    borderWidth: pendingStrokeWidth,
                  }}
                  aria-label={`Select fill color ${color}`}
                  onClick={() => setPendingFill(color)}
                >
                  {pendingFill === color ? "✓" : "•"}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Base stroke</Label>
            <div className="flex flex-row flex-wrap gap-2">
              {[...NEUTRAL_COLORS, pendingFill].map((color: string) => (
                <Button
                  key={color}
                  type="button"
                  aria-label={`Select stroke color ${color}`}
                  className="h-8 w-8 rounded-full p-0"
                  disabled={pendingStrokeWidth <= 0}
                  size="icon"
                  style={{
                    backgroundColor: pendingFill,
                    borderColor: color,
                    borderWidth: pendingStrokeWidth,
                  }}
                  variant="outline"
                  onClick={() => setPendingStroke(color)}
                >
                  {pendingStroke === color ? "✓" : "•"}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-stroke-width">Stroke width</Label>
            <Input
              id="settings-stroke-width"
              type="number"
              min={0}
              max={10}
              step={1}
              value={pendingStrokeWidth}
              onChange={(e) =>
                setPendingStrokeWidth(Number(e.target.value))
              }
              className="w-24"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-spacing">Spacing</Label>
            <Input
              id="settings-spacing"
              type="number"
              min={0}
              max={40}
              step={1}
              value={pendingSpacing}
              onChange={(e) => setPendingSpacing(Number(e.target.value))}
              className="w-24"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
