'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SquareArrowDown, SquareArrowLeft, SquareArrowRight, SquareArrowUp } from 'lucide-react';
import { NEUTRAL_COLORS, PALETTES } from './constants/palette';
import type { ExpandMapEdge } from './expand-map';
import { MAX_GRID_DIMENSION, MIN_GRID_DIMENSION } from './expand-map';
import { useHexMapSettings } from './settings-context';

type Orientation = 'flat' | 'pointy';

function GridSettingsFields({
  onSaveComplete,
  onExpandEdge,
  onShrinkEdge,
  onClose,
}: {
  onSaveComplete: () => void;
  onExpandEdge: (edge: ExpandMapEdge) => void;
  onShrinkEdge: (edge: ExpandMapEdge) => void;
  onClose: () => void;
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
  const [pendingOrientation, setPendingOrientation] = useState<Orientation>(orientation);

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
    onClose();
  };

  return (
    <>
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
            max={MAX_GRID_DIMENSION}
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
            max={MAX_GRID_DIMENSION}
            value={pendingHeight}
            onChange={(e) => setPendingHeight(Number(e.target.value))}
            className="w-24"
          />
        </div>
        <div className="space-y-2">
          <Label>Expand map</Label>
          <p className="text-muted-foreground text-xs">
            Add one column or row on a side. Applies immediately; undo with ⌘Z.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={width >= MAX_GRID_DIMENSION}
              onClick={() => onExpandEdge('left')}
            >
              <SquareArrowLeft className="h-3.5 w-3.5" />
              Column left
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={width >= MAX_GRID_DIMENSION}
              onClick={() => onExpandEdge('right')}
            >
              Column right
              <SquareArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={height >= MAX_GRID_DIMENSION}
              onClick={() => onExpandEdge('top')}
            >
              <SquareArrowUp className="h-3.5 w-3.5" />
              Row top
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={height >= MAX_GRID_DIMENSION}
              onClick={() => onExpandEdge('bottom')}
            >
              <SquareArrowDown className="h-3.5 w-3.5" />
              Row bottom
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Shrink map</Label>
          <p className="text-muted-foreground text-xs">
            Remove one column or row from a side. Applies immediately; undo with ⌘Z.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={width <= MIN_GRID_DIMENSION}
              onClick={() => onShrinkEdge('left')}
            >
              <SquareArrowRight className="h-3.5 w-3.5" />
              Column left
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={width <= MIN_GRID_DIMENSION}
              onClick={() => onShrinkEdge('right')}
            >
              Column right
              <SquareArrowLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={height <= MIN_GRID_DIMENSION}
              onClick={() => onShrinkEdge('top')}
            >
              <SquareArrowDown className="h-3.5 w-3.5" />
              Row top
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={height <= MIN_GRID_DIMENSION}
              onClick={() => onShrinkEdge('bottom')}
            >
              <SquareArrowUp className="h-3.5 w-3.5" />
              Row bottom
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Orientation</Label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="orientation"
                checked={pendingOrientation === 'flat'}
                onChange={() => setPendingOrientation('flat')}
              />
              Flat-topped
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="orientation"
                checked={pendingOrientation === 'pointy'}
                onChange={() => setPendingOrientation('pointy')}
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
            onChange={(e) => setPendingPalette(e.target.value as keyof typeof PALETTES)}
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
                variant={pendingFill === color ? 'default' : 'outline'}
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
                {pendingFill === color ? '✓' : '•'}
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
                {pendingStroke === color ? '✓' : '•'}
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
            onChange={(e) => setPendingStrokeWidth(Number(e.target.value))}
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
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave}>
          Save
        </Button>
      </DialogFooter>
    </>
  );
}

export function HexMapGridSettingsDialog({
  open,
  draftKey,
  onOpenChange,
  onSaveComplete,
  onExpandEdge,
  onShrinkEdge,
}: {
  open: boolean;
  /** Bumps when the user opens the dialog so draft state remounts from current context. */
  draftKey: number;
  onOpenChange: (open: boolean) => void;
  onSaveComplete: () => void;
  onExpandEdge: (edge: ExpandMapEdge) => void;
  onShrinkEdge: (edge: ExpandMapEdge) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        {open ? (
          <GridSettingsFields
            key={draftKey}
            onSaveComplete={onSaveComplete}
            onExpandEdge={onExpandEdge}
            onShrinkEdge={onShrinkEdge}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
