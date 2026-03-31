"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { NEUTRAL_COLORS, PALETTES } from "./constants/palette";
import {
  Stamp,
  STAMP_GROUP_ORDER,
  STAMP_ICONS,
  STAMPS,
  Stamps,
} from "./constants/stamps";
import { cn } from "@/lib/utils";
import {
  CircleDashed,
  Ellipsis,
  Eraser,
  Paintbrush,
  PaintBucket,
  Pipette,
  Search,
  Settings,
} from "lucide-react";
import { useHexMapBrush, type HexMapTool } from "./brush-context";
import { HexMapGridSettingsDialog } from "./grid-settings-dialog";
import { useHexMapSettings } from "./settings-context";

export interface HexMapToolbarProps {
  handleExport: () => void;
  handleImportClick: () => void;
  handleClear: () => void;
  zoom: number;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleZoomReset: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function HexMapToolbar(props: HexMapToolbarProps) {
  const {
    handleExport,
    handleImportClick,
    handleClear,
    zoom,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
  } = props;

  const {
    activeTool,
    setActiveTool,
    brushColor,
    setBrushColor,
    brushStroke,
    setBrushStroke,
    brushStrokeWidth,
    setBrushStrokeWidth,
    selectedStamp,
    setSelectedStamp,
  } = useHexMapBrush();

  const { palette } = useHexMapSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const commandKey = e.metaKey || e.ctrlKey;
      if (!commandKey) return;
      switch (e.key) {
        case "n":
          e.preventDefault();
          handleClear();
          break;
        case "i":
          e.preventDefault();
          handleImportClick();
          break;
        case "e":
          e.preventDefault();
          handleExport();
          break;
        case "=":
          e.preventDefault();
          handleZoomIn();
          break;
        case "-":
          e.preventDefault();
          handleZoomOut();
          break;
        case "0":
          e.preventDefault();
          handleZoomReset();
          break;
        default:
          break;
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [
    handleClear,
    handleExport,
    handleImportClick,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
  ]);

  return (
    <>
      <div
        className={cn(
          "flex flex-wrap items-center justify-center gap-1 rounded-lg border p-1 shadow-xs",
          "bg-background"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="File and grid settings">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={handleClear}>
              Clear <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExport}>
              Export <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleImportClick}>
              Import <DropdownMenuShortcut>⌘I</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
              Grid settings…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Zoom">
              <Search className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={handleZoomOut}>
              Zoom out <DropdownMenuShortcut>⌘-</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Zoom: {zoom.toFixed(2)}×</DropdownMenuItem>
            <DropdownMenuItem onClick={handleZoomIn}>
              Zoom in <DropdownMenuShortcut>⌘+</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="bg-border mx-1 hidden h-6 w-px sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full p-0"
              aria-label="Fill, stroke, and stamp"
              style={{
                backgroundColor: brushColor,
                borderColor: brushStroke,
                borderWidth: brushStrokeWidth,
              }}
            >
              {(() => {
                const Icon = STAMP_ICONS.find((i) => i.name === selectedStamp)
                  ?.icon;
                return Icon && Icon !== CircleDashed ? (
                  <Icon size={16} />
                ) : null;
              })()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 p-3" align="start">
            <div className="mb-3">
              <Label className="mb-1 block text-xs">Fill</Label>
              <div className="flex flex-row flex-wrap gap-2">
                {PALETTES[palette].map((color) => (
                  <Button
                    key={color}
                    type="button"
                    variant={brushColor === color ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8 rounded-full p-0"
                    style={{
                      backgroundColor: color,
                      borderColor: brushStroke,
                      borderWidth: brushStrokeWidth,
                    }}
                    aria-label={`Select fill color ${color}`}
                    onClick={() => setBrushColor(color)}
                  >
                    {brushColor === color ? "✓" : "•"}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <Label className="mb-1 block text-xs">Stroke</Label>
              <div className="flex flex-row flex-wrap gap-2">
                {[...NEUTRAL_COLORS, brushColor]
                  .filter((color, idx, arr) => arr.indexOf(color) === idx)
                  .map((color) => (
                    <Button
                      key={color}
                      type="button"
                      variant={brushStroke === color ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8 rounded-full p-0"
                      style={{
                        backgroundColor: brushColor,
                        borderColor: color,
                        borderWidth: brushStrokeWidth,
                      }}
                      aria-label={`Select stroke color ${color}`}
                      onClick={() => setBrushStroke(color)}
                    >
                      {brushStroke === color ? "✓" : "•"}
                    </Button>
                  ))}
              </div>
            </div>
            <div className="mb-3 flex items-center gap-2">
              <Label htmlFor="brush-stroke-width" className="text-xs">
                Stroke width
              </Label>
              <Input
                id="brush-stroke-width"
                type="number"
                min={0}
                max={10}
                step={1}
                value={brushStrokeWidth}
                onChange={(e) => setBrushStrokeWidth(Number(e.target.value))}
                className="h-7 w-14 px-2 py-1 text-xs"
              />
            </div>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2">
                <span>Stamp</span>
                {(() => {
                  const Icon = STAMP_ICONS.find((i) => i.name === selectedStamp)
                    ?.icon;
                  return Icon ? <Icon size={16} /> : null;
                })()}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="max-h-72 overflow-y-auto p-2">
                {STAMP_GROUP_ORDER.map((groupKey, groupIdx) => (
                  <React.Fragment key={groupKey}>
                    {groupIdx > 0 && <DropdownMenuSeparator />}
                    <div className="mb-1 flex flex-row flex-wrap gap-2">
                      {(STAMPS as Stamps)[groupKey].map(
                        ({ name, icon }: Stamp) => (
                          <Button
                            key={name}
                            type="button"
                            variant={
                              selectedStamp === name ? "default" : "outline"
                            }
                            size="icon"
                            className="flex h-10 w-10 items-center justify-center rounded-full p-0"
                            aria-label={`Select stamp ${name}`}
                            onClick={() => setSelectedStamp(name)}
                          >
                            {React.createElement(icon, { size: 20 })}
                          </Button>
                        )
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>

        <ToggleGroup
          size="sm"
          type="single"
          value={activeTool}
          onValueChange={(val) =>
            setActiveTool((val as HexMapTool) || activeTool)
          }
        >
          <ToggleGroupItem value="paint" aria-label="Paintbrush">
            <Paintbrush className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="bucket" aria-label="Paint bucket">
            <PaintBucket className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="eyedrop" aria-label="Eyedropper">
            <Pipette className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="erase" aria-label="Eraser">
            <Eraser className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <span className="bg-border mx-1 hidden h-6 w-px sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More">
              <Ellipsis className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleUndo} disabled={!canUndo}>
              Undo <DropdownMenuShortcut>⌘Z</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRedo} disabled={!canRedo}>
              Redo <DropdownMenuShortcut>⇧⌘Z</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <HexMapGridSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSaveComplete={handleZoomReset}
      />
    </>
  );
}
