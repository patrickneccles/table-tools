'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { NEUTRAL_COLORS, PALETTES } from './constants/palette';
import {
  Stamp,
  STAMP_GROUP_LABELS,
  STAMP_GROUP_ORDER,
  STAMP_ICONS,
  STAMPS,
  Stamps,
  type StampIconProps,
} from './constants/stamps';
import { cn } from '@/lib/utils';
import {
  Eraser,
  ImageDown,
  Paintbrush,
  PaintBucket,
  Pipette,
  Printer,
  Redo2,
  Settings,
  Type,
  Undo2,
  ZoomIn,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useHexMapBrush, type HexMapTool } from './brush-context';
import type { ExpandMapEdge } from './expand-map';
import { HexMapGridSettingsDialog } from './grid-settings-dialog';
import { useHexMapSettings } from './settings-context';

type StampLucideIcon = React.ComponentType<StampIconProps>;

const TOOLS = [
  { value: 'paint' as const, icon: <Paintbrush className="h-4 w-4" />, label: 'Paint' },
  { value: 'bucket' as const, icon: <PaintBucket className="h-4 w-4" />, label: 'Fill' },
  { value: 'eyedrop' as const, icon: <Pipette className="h-4 w-4" />, label: 'Eyedropper' },
  { value: 'erase' as const, icon: <Eraser className="h-4 w-4" />, label: 'Erase' },
  { value: 'text' as const, icon: <Type className="h-4 w-4" />, label: 'Text label' },
];

/** Border width for small on-screen swatches (matches map tile feel without overwhelming tiny circles). */
function swatchBorderPx(strokeWidth: number, diameterPx: number): number {
  if (strokeWidth <= 0) return 1;
  const capped = Math.min(strokeWidth, 8);
  return Math.min(capped, Math.max(1, Math.round(diameterPx / 11)));
}

function StampTileSwatch({
  icon: Icon,
  fillColor,
  strokeColor,
  strokeWidth,
  diameterPx,
  selected,
  className,
}: {
  icon: StampLucideIcon | null | undefined;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  diameterPx: number;
  selected?: boolean;
  className?: string;
}) {
  const bw = swatchBorderPx(strokeWidth, diameterPx);
  const iconSize = Math.max(10, Math.round(diameterPx * 0.5));
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full box-border',
        selected && 'z-[1] outline outline-2 outline-offset-2 outline-primary',
        className
      )}
      style={{
        width: diameterPx,
        height: diameterPx,
        backgroundColor: fillColor,
        border: `${bw}px solid ${strokeColor}`,
        color: strokeColor,
      }}
    >
      {Icon ? <Icon size={iconSize} /> : null}
    </span>
  );
}

export interface HexMapToolbarProps {
  handleExport: () => void;
  handleExportPNG: () => void;
  handlePrint: () => void;
  handleImportClick: () => void;
  handleClear: () => void;
  onExpandEdge: (edge: ExpandMapEdge) => void;
  onShrinkEdge: (edge: ExpandMapEdge) => void;
  zoom: number;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleZoomReset: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  mapName: string;
  onMapNameChange: (name: string) => void;
}

export function HexMapToolbar(props: HexMapToolbarProps) {
  const {
    handleExport,
    handleExportPNG,
    handlePrint,
    handleImportClick,
    handleClear,
    onExpandEdge,
    onShrinkEdge,
    zoom,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    mapName,
    onMapNameChange,
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
  const [settingsDraftKey, setSettingsDraftKey] = useState(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const commandKey = e.metaKey || e.ctrlKey;
      if (!commandKey) return;
      switch (e.key) {
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
          break;
        case 'y':
          e.preventDefault();
          handleRedo();
          break;
        case 'n':
          e.preventDefault();
          handleClear();
          break;
        case 'i':
          e.preventDefault();
          handleImportClick();
          break;
        case 'e':
          e.preventDefault();
          handleExport();
          break;
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleZoomReset();
          break;
        default:
          break;
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [
    handleClear,
    handleExport,
    handleImportClick,
    handleUndo,
    handleRedo,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
  ]);

  return (
    <>
      <div
        className={cn(
          'flex flex-wrap items-center justify-center gap-1 rounded-lg border p-1 shadow-xs',
          'bg-background',
          'lg:flex-col lg:flex-nowrap'
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full border-0 bg-transparent p-0 shadow-none hover:bg-transparent"
              aria-label="Fill, stroke, and stamp"
            >
              <StampTileSwatch
                icon={STAMP_ICONS.find((i) => i.name === selectedStamp)?.icon ?? undefined}
                fillColor={brushColor}
                strokeColor={brushStroke}
                strokeWidth={brushStrokeWidth}
                diameterPx={36}
              />
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
                    variant={brushColor === color ? 'default' : 'outline'}
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
                    {brushColor === color ? '✓' : '•'}
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
                      variant={brushStroke === color ? 'default' : 'outline'}
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
                      {brushStroke === color ? '✓' : '•'}
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
              <DropdownMenuSubTrigger className="flex w-full items-center gap-2">
                <span className="flex-1 text-left">Stamp</span>
                <StampTileSwatch
                  icon={STAMP_ICONS.find((i) => i.name === selectedStamp)?.icon}
                  fillColor={brushColor}
                  strokeColor={brushStroke}
                  strokeWidth={brushStrokeWidth}
                  diameterPx={30}
                />
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                sideOffset={4}
                className="max-h-[min(70vh,24rem)] w-[min(100vw-1rem,22rem)] max-w-[calc(100vw-1rem)] space-y-3 overflow-x-hidden !overflow-y-auto p-2"
              >
                {STAMP_GROUP_ORDER.map((groupKey) => (
                  <div key={groupKey} className="min-w-0">
                    <div className="mb-1.5 text-xs font-medium text-muted-foreground">
                      {STAMP_GROUP_LABELS[groupKey]}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(STAMPS as Stamps)[groupKey].map(({ name, icon }: Stamp) => (
                        <Button
                          key={name}
                          type="button"
                          variant="ghost"
                          className="h-11 w-11 shrink-0 rounded-full p-0 hover:bg-transparent focus-visible:bg-accent/50"
                          aria-label={`Select stamp ${name}`}
                          aria-pressed={selectedStamp === name}
                          onClick={() => setSelectedStamp(name)}
                        >
                          <StampTileSwatch
                            icon={icon}
                            fillColor={brushColor}
                            strokeColor={brushStroke}
                            strokeWidth={brushStrokeWidth}
                            diameterPx={40}
                            selected={selectedStamp === name}
                          />
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>

        <ToggleGroup
          size="sm"
          type="single"
          value={activeTool}
          onValueChange={(val) => setActiveTool((val as HexMapTool) || activeTool)}
          className="lg:flex-col"
        >
          {TOOLS.map(({ value, icon, label }) => (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <ToggleGroupItem value={value} aria-label={label}>
                  {icon}
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>

        <span className="bg-border hidden sm:block mx-1 h-6 w-px lg:mx-0 lg:my-1 lg:h-px lg:w-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleUndo}
              disabled={!canUndo}
              aria-label="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Undo <kbd className="ml-1 font-mono">⌘Z</kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRedo}
              disabled={!canRedo}
              aria-label="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Redo <kbd className="ml-1 font-mono">⇧⌘Z</kbd>
          </TooltipContent>
        </Tooltip>

        <span className="bg-border hidden sm:block mx-1 h-6 w-px lg:mx-0 lg:my-1 lg:h-px lg:w-6" />

        <div className="flex items-center gap-0.5 lg:flex-col">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleZoomOut} aria-label="Zoom out">
                <span className="text-base font-medium leading-none">−</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Zoom out <kbd className="ml-1 font-mono">⌘−</kbd>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomReset}
                aria-label="Reset zoom"
                className="w-12 gap-0.5 px-1 text-xs text-muted-foreground"
              >
                <ZoomIn className="h-3 w-3 shrink-0" />
                {Math.round(zoom * 100)}%
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Reset zoom <kbd className="ml-1 font-mono">⌘0</kbd>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleZoomIn} aria-label="Zoom in">
                <span className="text-base font-medium leading-none">+</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Zoom in <kbd className="ml-1 font-mono">⌘+</kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="File and grid settings">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <div className="px-2 py-1.5">
              <Label htmlFor="map-name" className="mb-1 block text-xs text-muted-foreground">
                Map name
              </Label>
              <Input
                id="map-name"
                value={mapName}
                onChange={(e) => onMapNameChange(e.target.value)}
                className="h-7 text-xs"
                placeholder="Untitled Map"
              />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleUndo} disabled={!canUndo}>
              <Undo2 className="mr-2 h-4 w-4" />
              Undo <DropdownMenuShortcut>⌘Z</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRedo} disabled={!canRedo}>
              <Redo2 className="mr-2 h-4 w-4" />
              Redo <DropdownMenuShortcut>⇧⌘Z</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleClear}>
              Clear <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExport}>
              Export <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPNG}>
              <ImageDown className="mr-2 h-4 w-4" />
              Export PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print…
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleImportClick}>
              Import <DropdownMenuShortcut>⌘I</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setSettingsDraftKey((k) => k + 1);
                setSettingsOpen(true);
              }}
            >
              Grid settings…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <HexMapGridSettingsDialog
        open={settingsOpen}
        draftKey={settingsDraftKey}
        onOpenChange={setSettingsOpen}
        onSaveComplete={handleZoomReset}
        onExpandEdge={onExpandEdge}
        onShrinkEdge={onShrinkEdge}
      />
    </>
  );
}
