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
import { SaveStatusIndicator } from '@/components/save-status-indicator';
import {
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  SquareArrowDown,
  SquareArrowLeft,
  SquareArrowRight,
  SquareArrowUp,
} from 'lucide-react';
import {
  createFile,
  downloadFile,
  renameFile,
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
import { ExpandMapEdge, MAX_GRID_DIMENSION, MIN_GRID_DIMENSION } from './expand-map';
import { generateHexes, deriveDimensions, getHexNeighbors, regenerateGrid } from './hex-utils';
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

  // colOffset is the axial q value of column 0 (flat-top). Changing it shifts
  // which column is "up" vs "down" in the stagger without moving existing hexes.
  const [colOffset, setColOffset] = useState(0);
  // rowOffset is the axial r value of row 0 (pointy-top). Same idea for rows.
  const [rowOffset, setRowOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [mapName, setMapName] = useState('Untitled Map');
  const [currentFile, setCurrentFile] = useState<TableToolsFile<HexFileV1> | null>(null);
  const [importErrorOpen, setImportErrorOpen] = useState(false);
  const [editingHex, setEditingHex] = useState<{ q: number; r: number } | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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
    const base = currentFile ? updateFile(currentFile, data) : createFile('hex-map', mapName, data);
    const file = base.name !== mapName ? renameFile(base, mapName) : base;
    setCurrentFile(file);
    downloadFile(file);
  };

  const handleExportPNG = () => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const svgClone = svgEl.cloneNode(true) as SVGSVGElement;

    // Add white background rect as first child
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', String(svgEl.width.baseVal.value));
    bg.setAttribute('height', String(svgEl.height.baseVal.value));
    bg.setAttribute('fill', 'white');
    svgClone.insertBefore(bg, svgClone.firstChild);

    // Replace foreignObject stamp elements with native SVG paths so the canvas
    // isn't tainted. Text editor foreignObjects (contain <input>) are dropped.
    const liveFOs = Array.from(svgEl.querySelectorAll('foreignObject'));
    const cloneFOs = Array.from(svgClone.querySelectorAll('foreignObject'));
    cloneFOs.forEach((cloneFO, idx) => {
      const liveFO = liveFOs[idx];
      if (!liveFO || liveFO.querySelector('input')) {
        cloneFO.remove();
        return;
      }
      const innerSvg = liveFO.querySelector('svg');
      if (!innerSvg) {
        cloneFO.remove();
        return;
      }
      const foX = parseFloat(cloneFO.getAttribute('x') ?? '0');
      const foY = parseFloat(cloneFO.getAttribute('y') ?? '0');
      const foW = parseFloat(cloneFO.getAttribute('width') ?? '24');
      const foH = parseFloat(cloneFO.getAttribute('height') ?? '24');
      const vbParts = (innerSvg.getAttribute('viewBox') ?? '0 0 24 24').split(' ').map(Number);
      const vbW = vbParts[2] || 24;
      const vbH = vbParts[3] || 24;
      const iconSize = foW * 0.7;
      const scale = iconSize / Math.max(vbW, vbH);
      const cx = foX + foW / 2;
      const cy = foY + foH / 2;
      const colorDiv = liveFO.querySelector('div') as HTMLElement | null;
      const iconColor = colorDiv?.style.color ?? '#333333';
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute(
        'transform',
        `translate(${cx - (vbW * scale) / 2}, ${cy - (vbH * scale) / 2}) scale(${scale})`
      );
      g.setAttribute('fill', 'none');
      g.setAttribute('stroke', iconColor);
      g.setAttribute('stroke-width', innerSvg.getAttribute('stroke-width') ?? '2');
      g.setAttribute('stroke-linecap', innerSvg.getAttribute('stroke-linecap') ?? 'round');
      g.setAttribute('stroke-linejoin', innerSvg.getAttribute('stroke-linejoin') ?? 'round');
      Array.from(innerSvg.children).forEach((child) => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', child.tagName);
        Array.from(child.attributes).forEach((attr) => el.setAttribute(attr.name, attr.value));
        g.appendChild(el);
      });
      cloneFO.parentNode?.replaceChild(g, cloneFO);
    });

    const svgStr = new XMLSerializer().serializeToString(svgClone);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svgEl.width.baseVal.value;
      canvas.height = svgEl.height.baseVal.value;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${mapName || 'hex-map'}.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');
    };
    img.src = url;
  };

  const handlePrint = () => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const svgStr = new XMLSerializer().serializeToString(svgEl);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${mapName || 'Hex Map'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: white; }
    svg { max-width: 100%; height: auto; }
    @media print { body { min-height: unset; } }
  </style>
</head>
<body>${svgStr}</body>
</html>`);
    win.document.close();
    win.onload = () => {
      win.focus();
      win.print();
    };
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
        const minQ = Math.min(...importedHexes.map((h) => h.q));
        setWidth(w);
        setHeight(h);
        // colOffset/rowOffset encode the stagger parity; derived from min(q)/min(r)
        // so imported maps restore their exact stagger pattern.
        setColOffset(imported.orientation === 'flat' ? minQ : 0);
        setRowOffset(
          imported.orientation === 'pointy' ? Math.min(...importedHexes.map((h) => h.r)) : 0
        );
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
    setColOffset(0);
    setRowOffset(0);
    setHexes(generateHexes(width, height, baseFill, orientation));
  };

  const handleShrinkEdge = (edge: ExpandMapEdge) => {
    if (edge === 'left' || edge === 'right') {
      if (width <= MIN_GRID_DIMENSION) return;
    } else {
      if (height <= MIN_GRID_DIMENSION) return;
    }

    captureSnapshot();

    if (edge === 'right') {
      setWidth(width - 1);
      return;
    }
    if (edge === 'bottom') {
      setHeight(height - 1);
      return;
    }

    // For left/top shrinks a naive q/r shift produces wrong visual positions due
    // to the stagger formula (flat: r = row - floor(col/2); pointy: q = col - floor(row/2)).
    // Instead, map each hex to its (col, row), drop the removed edge, shift, then
    // recompute (q, r) from the new position so the stagger is applied correctly.
    if (edge === 'left') {
      if (orientation === 'flat') {
        // Shift the column window rightward (drop the leftmost column).
        // Existing hexes keep their q values. The useEffect stops generating
        // the column at q = colOffset, which naturally removes it.
        setColOffset((prev) => prev + 1);
      } else {
        // Pointy: shifting all q values by -1 is correct.
        setHexes((prev) => prev.map((h) => ({ ...h, q: h.q - 1 })));
      }
      setWidth(width - 1);
      return;
    }

    // top
    if (orientation === 'flat') {
      // Shift all r values down by 1; the old top row falls outside the new grid.
      setHexes((prev) => prev.map((h) => ({ ...h, r: h.r - 1 })));
    } else {
      // Pointy: shift the row window downward. The old top row (r = rowOffset)
      // is no longer generated by the useEffect.
      setRowOffset((prev) => prev + 1);
    }
    setHeight(height - 1);
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
      if (orientation === 'flat') {
        // Shift the column window leftward. Existing hexes keep their q values
        // (and thus their visual positions). The useEffect creates the new
        // empty column at q = colOffset - 1, which has the correct stagger parity.
        setColOffset((prev) => prev - 1);
      } else {
        // Pointy: stagger is on rows, so shifting all q values by +1 is correct.
        setHexes((prev) => prev.map((h) => ({ ...h, q: h.q + 1 })));
      }
      setWidth(width + 1);
      return;
    }
    // top
    if (orientation === 'flat') {
      // Shift all r values up by 1; the useEffect creates the new empty top row.
      setHexes((prev) => prev.map((h) => ({ ...h, r: h.r + 1 })));
    } else {
      // Pointy: shift the row window upward. Existing hexes keep their r values.
      // The useEffect creates the new empty row at r = rowOffset - 1.
      setRowOffset((prev) => prev - 1);
    }
    setHeight(height + 1);
  };

  useEffect(() => {
    setHexes((prev) =>
      regenerateGrid(
        width,
        height,
        colOffset,
        rowOffset,
        orientation,
        (q, r) => ({
          q,
          r,
          color: baseFill,
        }),
        prev
      )
    );
  }, [width, height, orientation, baseFill, setHexes, colOffset, rowOffset]);

  // Load saved map on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('hex-map-canvas');
      if (!raw) return;
      const saved = JSON.parse(raw) as { hexes?: HexCell[]; mapName?: string };
      if (Array.isArray(saved.hexes) && saved.hexes.length > 0) {
        const { width: w, height: h } = deriveDimensions(saved.hexes);
        const hs = saved.hexes as HexCell[];
        resetHexes(hs);
        setColOffset(orientation === 'flat' ? Math.min(...hs.map((h) => h.q)) : 0);
        setRowOffset(orientation === 'pointy' ? Math.min(...hs.map((h) => h.r)) : 0);
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
          handleExportPNG={handleExportPNG}
          handlePrint={handlePrint}
          handleImportClick={handleImportClick}
          handleClear={handleClear}
          onExpandEdge={handleExpandEdge}
          onShrinkEdge={handleShrinkEdge}
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
          svgRef={svgRef}
        />
        <SaveStatusIndicator status={saveStatus} />
        <div className="pointer-events-none absolute inset-0 z-10">
          {/* Left edge: expand + shrink stacked */}
          <div className="pointer-events-auto absolute left-1 top-1/2 flex -translate-y-1/2 flex-col gap-1">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              disabled={width >= MAX_GRID_DIMENSION}
              className="h-8 w-8 rounded-full border bg-background/85 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
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
              disabled={width <= MIN_GRID_DIMENSION}
              className="h-8 w-8 rounded-full border bg-background/85 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
              aria-label="Remove column on the left"
              onClick={(e) => {
                e.stopPropagation();
                handleShrinkEdge('left');
              }}
            >
              <ArrowRightToLine className="h-4 w-4" />
            </Button>
          </div>

          {/* Right edge: expand + shrink stacked */}
          <div className="pointer-events-auto absolute right-1 top-1/2 flex -translate-y-1/2 flex-col gap-1">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              disabled={width >= MAX_GRID_DIMENSION}
              className="h-8 w-8 rounded-full border bg-background/85 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
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
              disabled={width <= MIN_GRID_DIMENSION}
              className="h-8 w-8 rounded-full border bg-background/85 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
              aria-label="Remove column on the right"
              onClick={(e) => {
                e.stopPropagation();
                handleShrinkEdge('right');
              }}
            >
              <ArrowLeftToLine className="h-4 w-4" />
            </Button>
          </div>

          {/* Top edge: expand + shrink side by side */}
          <div className="pointer-events-auto absolute left-1/2 top-1 flex -translate-x-1/2 flex-row gap-1">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              disabled={height >= MAX_GRID_DIMENSION}
              className="h-8 w-8 rounded-full border bg-background/85 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
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
              disabled={height <= MIN_GRID_DIMENSION}
              className="h-8 w-8 rounded-full border bg-background/85 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
              aria-label="Remove row on the top"
              onClick={(e) => {
                e.stopPropagation();
                handleShrinkEdge('top');
              }}
            >
              <ArrowDownToLine className="h-4 w-4" />
            </Button>
          </div>

          {/* Bottom edge: expand + shrink side by side */}
          <div className="pointer-events-auto absolute bottom-1 left-1/2 flex -translate-x-1/2 flex-row gap-1">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              disabled={height >= MAX_GRID_DIMENSION}
              className="h-8 w-8 rounded-full border bg-background/85 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
              aria-label="Add row on the bottom"
              onClick={(e) => {
                e.stopPropagation();
                handleExpandEdge('bottom');
              }}
            >
              <SquareArrowDown className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              disabled={height <= MIN_GRID_DIMENSION}
              className="h-8 w-8 rounded-full border bg-background/85 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
              aria-label="Remove row on the bottom"
              onClick={(e) => {
                e.stopPropagation();
                handleShrinkEdge('bottom');
              }}
            >
              <ArrowUpToLine className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
