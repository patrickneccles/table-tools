'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Check,
  SquareArrowDown,
  SquareArrowLeft,
  SquareArrowRight,
  SquareArrowUp,
} from 'lucide-react';
import {
  createFile,
  downloadFile,
  type TableToolsFile,
  updateFile,
  uploadFile,
} from '@/lib/file-system';
import { useHistory } from '@/hooks/use-history';
import React, { useEffect, useRef, useState } from 'react';
import { HexMapBrushProvider, useHexMapBrush } from './brush-context';
import { STAMP_ICONS } from './constants/stamps';
import { exportHexGridV1, type HexFileV1, importHexGrid } from './hex-map-file';
import { HexGrid } from './hex-grid';
import { HexMapSettingsProvider, useHexMapSettings } from './settings-context';
import { ExpandMapEdge, MAX_GRID_DIMENSION } from './expand-map';
import { generateHexes, deriveDimensions, getHexNeighbors } from './hex-utils';
import { HexMapToolbar } from './toolbar';

export const HexMapCanvas: React.FC = () => (
  <HexMapBrushProvider>
    <HexMapSettingsProvider>
      <HexMapCanvasInner />
    </HexMapSettingsProvider>
  </HexMapBrushProvider>
);

type HexCell = {
  q: number;
  r: number;
  color: string;
  stroke?: string;
  strokeWidth?: number;
  stamp?: string;
  label?: string;
};

const HexMapCanvasInner: React.FC = () => {
  const [zoom, setZoom] = useState(1);

  // Settings must come before hex history so baseFill/orientation are available for initialization
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
  } = useHexMapSettings();
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

  const {
    state: hexes,
    setState: setHexes,
    reset: resetHexes,
    undo: handleUndo,
    redo: handleRedo,
    canUndo,
    canRedo,
    captureSnapshot,
  } = useHistory<HexCell[]>(generateHexes(width, height, baseFill, orientation), 50);

  const [isDragging, setIsDragging] = useState(false);
  const [mapName, setMapName] = useState('Untitled Map');
  const [currentFile, setCurrentFile] = useState<TableToolsFile<HexFileV1> | null>(null);
  const [importErrorOpen, setImportErrorOpen] = useState(false);
  const [editingHex, setEditingHex] = useState<{ q: number; r: number } | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const size = 30 * zoom;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.3));
  const handleZoomReset = () => setZoom(1);

  const applyToolToHex = (q: number, r: number, currentHexes: HexCell[]) => {
    if (activeTool === 'erase') {
      return currentHexes.map((hex) =>
        hex.q === q && hex.r === r
          ? { ...hex, color: baseFill, stroke, strokeWidth, stamp: undefined, label: undefined }
          : hex
      );
    }
    if (activeTool === 'paint') {
      return currentHexes.map((hex) =>
        hex.q === q && hex.r === r
          ? {
              ...hex,
              color: brushColor,
              stroke: brushStroke,
              strokeWidth: brushStrokeWidth,
              stamp: selectedStamp === 'No Stamp' ? undefined : selectedStamp,
            }
          : hex
      );
    }
    return currentHexes;
  };

  const handleHexClick = (q: number, r: number) => {
    if (activeTool === 'eyedrop') {
      const hex = hexes.find((h) => h.q === q && h.r === r);
      if (hex) {
        setBrushColor(hex.color);
        if ('stroke' in hex && typeof hex.stroke === 'string') setBrushStroke(hex.stroke);
        if ('strokeWidth' in hex && typeof hex.strokeWidth === 'number')
          setBrushStrokeWidth(hex.strokeWidth);
        setSelectedStamp('stamp' in hex && typeof hex.stamp === 'string' ? hex.stamp : 'No Stamp');
      }
      setActiveTool('paint');
      return;
    }
    if (activeTool === 'erase') {
      captureSnapshot();
      setHexes((prev) =>
        prev.map((hex) =>
          hex.q === q && hex.r === r
            ? { ...hex, color: baseFill, stroke, strokeWidth, stamp: undefined, label: undefined }
            : hex
        )
      );
      return;
    }
    if (activeTool === 'text') {
      const hex = hexes.find((h) => h.q === q && h.r === r);
      setEditingLabel(hex?.label ?? '');
      setEditingHex({ q, r });
      return;
    }
    if (activeTool === 'paint') {
      captureSnapshot();
      setHexes((prev) =>
        prev.map((hex) =>
          hex.q === q && hex.r === r
            ? {
                ...hex,
                color: brushColor,
                stroke: brushStroke,
                strokeWidth: brushStrokeWidth,
                stamp: selectedStamp === 'No Stamp' ? undefined : selectedStamp,
              }
            : hex
        )
      );
      return;
    }
    if (activeTool === 'bucket') {
      const clicked = hexes.find((h) => h.q === q && h.r === r);
      if (!clicked) return;
      const targetColor = clicked.color;
      const targetStroke = clicked.stroke ?? stroke;
      const targetStrokeWidth = clicked.strokeWidth ?? strokeWidth;
      const targetStamp = clicked.stamp ?? undefined;
      const match = (h: HexCell) =>
        h.color === targetColor &&
        (h.stroke ?? stroke) === targetStroke &&
        (h.strokeWidth ?? strokeWidth) === targetStrokeWidth &&
        (h.stamp ?? undefined) === targetStamp;
      const visited = new Set<string>();
      const toFill = [{ q, r }];
      while (toFill.length > 0) {
        const { q: cq, r: cr } = toFill.pop()!;
        const key = `${cq},${cr}`;
        if (visited.has(key)) continue;
        const hex = hexes.find((h) => h.q === cq && h.r === cr);
        if (!hex || !match(hex)) continue;
        visited.add(key);
        getHexNeighbors(cq, cr).forEach(({ q: nq, r: nr }) => {
          if (!visited.has(`${nq},${nr}`)) {
            const neighbor = hexes.find((h) => h.q === nq && h.r === nr);
            if (neighbor && match(neighbor)) toFill.push({ q: nq, r: nr });
          }
        });
      }
      captureSnapshot();
      setHexes((prev) =>
        prev.map((hex) =>
          visited.has(`${hex.q},${hex.r}`)
            ? {
                ...hex,
                color: brushColor,
                stroke: brushStroke,
                strokeWidth: brushStrokeWidth,
                stamp: selectedStamp === 'No Stamp' ? undefined : selectedStamp,
              }
            : hex
        )
      );
    }
  };

  const handleHexPointerDown = (q: number, r: number) => {
    if (activeTool === 'paint' || activeTool === 'erase') {
      captureSnapshot(); // save pre-drag state as the undo point
      setIsDragging(true);
      setHexes((prev) => applyToolToHex(q, r, prev));
    }
  };

  const handleHexPointerEnter = (q: number, r: number) => {
    if (isDragging && (activeTool === 'paint' || activeTool === 'erase')) {
      setHexes((prev) => applyToolToHex(q, r, prev));
    }
  };

  const handlePointerUp = () => {
    if (isDragging) setIsDragging(false);
  };

  const handleEditingConfirm = () => {
    if (!editingHex) return;
    const currentHex = hexes.find((h) => h.q === editingHex.q && h.r === editingHex.r);
    const newLabel = editingLabel.trim() || undefined;
    if (currentHex?.label !== newLabel) {
      captureSnapshot();
      setHexes((prev) =>
        prev.map((h) =>
          h.q === editingHex.q && h.r === editingHex.r ? { ...h, label: newLabel } : h
        )
      );
    }
    setEditingHex(null);
    setEditingLabel('');
  };

  const handleEditingCancel = () => {
    setEditingHex(null);
    setEditingLabel('');
  };

  const handleExport = () => {
    const data = exportHexGridV1({ hexes, stroke, strokeWidth, spacing, orientation });
    const file = currentFile ? updateFile(currentFile, data) : createFile('hex-map', mapName, data);
    setCurrentFile(file);
    downloadFile(file);
  };

  const handleImportClick = async () => {
    try {
      const file = await uploadFile<HexFileV1>('hex-map');
      const imported = importHexGrid(file.data);
      setCurrentFile(file);
      setMapName(file.name);
      const importedHexes = imported.hexes as HexCell[];
      setHexes(importedHexes);
      if (importedHexes.length > 0) {
        const { width: w, height: h } = deriveDimensions(importedHexes);
        setWidth(w);
        setHeight(h);
      }
      setStroke(imported.stroke);
      setStrokeWidth(imported.strokeWidth);
      setSpacing(imported.spacing);
      if (imported.orientation === 'pointy' || imported.orientation === 'flat') {
        setOrientation(imported.orientation);
      }
    } catch (err) {
      if (err instanceof Error && err.message !== 'File selection cancelled.') {
        setImportErrorOpen(true);
      }
    }
  };

  const handleClear = () => {
    captureSnapshot();
    setHexes(generateHexes(width, height, baseFill, orientation));
  };

  const handleExpandEdge = (edge: ExpandMapEdge) => {
    if (edge === 'left' || edge === 'right') {
      if (width >= MAX_GRID_DIMENSION) return;
    } else {
      if (height >= MAX_GRID_DIMENSION) return;
    }

    captureSnapshot();

    if (edge === 'right') {
      setWidth(width + 1);
      return;
    }
    if (edge === 'bottom') {
      setHeight(height + 1);
      return;
    }
    if (edge === 'left') {
      setHexes((prev) => prev.map((h) => ({ ...h, q: h.q + 1 })));
      setWidth(width + 1);
      return;
    }
    // top
    setHexes((prev) => prev.map((h) => ({ ...h, r: h.r + 1 })));
    setHeight(height + 1);
  };

  useEffect(() => {
    // Regenerate grid when dimensions/orientation/baseFill change, preserving any painted cells
    setHexes((prev) => {
      const prevMap = new Map(prev.map((hex) => [`${hex.q},${hex.r}`, hex]));
      const newHexes: HexCell[] = [];
      if (orientation === 'flat') {
        for (let col = 0; col < width; col++) {
          for (let row = 0; row < height; row++) {
            const q = col;
            const r = row - Math.floor(col / 2);
            const key = `${q},${r}`;
            const prevHex = prevMap.get(key);
            newHexes.push(prevHex ? { ...prevHex } : { q, r, color: baseFill });
          }
        }
      } else {
        for (let row = 0; row < height; row++) {
          for (let col = 0; col < width; col++) {
            const q = col - Math.floor(row / 2);
            const r = row;
            const key = `${q},${r}`;
            const prevHex = prevMap.get(key);
            newHexes.push(prevHex ? { ...prevHex } : { q, r, color: baseFill });
          }
        }
      }
      return newHexes;
    });
  }, [width, height, orientation, baseFill, setHexes]);

  // Load saved map on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('hex-map-canvas');
      if (!raw) return;
      const saved = JSON.parse(raw) as { hexes?: HexCell[]; mapName?: string };
      if (Array.isArray(saved.hexes) && saved.hexes.length > 0) {
        const { width: w, height: h } = deriveDimensions(saved.hexes);
        resetHexes(saved.hexes);
        setWidth(w);
        setHeight(h);
      }
      if (typeof saved.mapName === 'string') setMapName(saved.mapName);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save map to localStorage (debounced)
  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (savedStatusTimerRef.current) clearTimeout(savedStatusTimerRef.current);
    setSaveStatus('saving');
    autoSaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem('hex-map-canvas', JSON.stringify({ hexes, mapName }));
      } catch {
        /* ignore storage errors */
      }
      setSaveStatus('saved');
      savedStatusTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      if (savedStatusTimerRef.current) clearTimeout(savedStatusTimerRef.current);
    };
  }, [hexes, mapName]);

  return (
    <div className="flex h-full w-full min-h-0 flex-col gap-2 lg:flex-row">
      <AlertDialog open={importErrorOpen} onOpenChange={setImportErrorOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Could not import file</AlertDialogTitle>
            <AlertDialogDescription>
              The file must be valid JSON in the hex map export format (version 1).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="order-1 flex w-full shrink-0 justify-center lg:order-2 lg:w-auto lg:items-start">
        <HexMapToolbar
          handleExport={handleExport}
          handleImportClick={handleImportClick}
          handleClear={handleClear}
          onExpandEdge={handleExpandEdge}
          zoom={zoom}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
          handleZoomReset={handleZoomReset}
          handleUndo={handleUndo}
          handleRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          mapName={mapName}
          onMapNameChange={setMapName}
        />
      </div>
      <div
        className="bg-card relative order-2 flex min-h-0 flex-1 rounded-lg border lg:order-1"
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <HexGrid
          hexes={hexes}
          size={size}
          orientation={orientation}
          spacing={spacing}
          strokeWidth={strokeWidth}
          stroke={stroke}
          onHexClick={handleHexClick}
          onHexPointerDown={handleHexPointerDown}
          onHexPointerEnter={handleHexPointerEnter}
          isDragging={isDragging}
          stampIcons={STAMP_ICONS}
          editingHex={editingHex}
          editingLabel={editingLabel}
          onEditingLabelChange={setEditingLabel}
          onEditingConfirm={handleEditingConfirm}
          onEditingCancel={handleEditingCancel}
        />
        {saveStatus !== 'idle' && (
          <div className="pointer-events-none absolute right-2 top-2 z-20 flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm">
            {saveStatus === 'saving' ? (
              <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            ) : (
              <Check className="h-3 w-3 text-emerald-500" />
            )}
            {saveStatus === 'saving' ? 'Saving…' : 'Saved'}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 z-10">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            disabled={width >= MAX_GRID_DIMENSION}
            className="pointer-events-auto absolute left-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border bg-background/85 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
            title="Add column on the left"
            aria-label="Add column on the left"
            onClick={(e) => {
              e.stopPropagation();
              handleExpandEdge('left');
            }}
          >
            <SquareArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            disabled={width >= MAX_GRID_DIMENSION}
            className="pointer-events-auto absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border bg-background/85 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
            title="Add column on the right"
            aria-label="Add column on the right"
            onClick={(e) => {
              e.stopPropagation();
              handleExpandEdge('right');
            }}
          >
            <SquareArrowRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            disabled={height >= MAX_GRID_DIMENSION}
            className="pointer-events-auto absolute left-1/2 top-1 h-8 w-8 -translate-x-1/2 rounded-full border bg-background/85 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
            title="Add row on the top"
            aria-label="Add row on the top"
            onClick={(e) => {
              e.stopPropagation();
              handleExpandEdge('top');
            }}
          >
            <SquareArrowUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            disabled={height >= MAX_GRID_DIMENSION}
            className="pointer-events-auto absolute bottom-1 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full border bg-background/85 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
            title="Add row on the bottom"
            aria-label="Add row on the bottom"
            onClick={(e) => {
              e.stopPropagation();
              handleExpandEdge('bottom');
            }}
          >
            <SquareArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
