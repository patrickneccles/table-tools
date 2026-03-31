"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React, { useEffect, useRef, useState } from "react";
import { HexMapBrushProvider, useHexMapBrush } from "./brush-context";
import { STAMP_ICONS } from "./constants/stamps";
import { exportHexGridV1, importHexGrid } from "./hex-map-file";
import { HexGrid } from "./hex-grid";
import { HexMapSettingsProvider, useHexMapSettings } from "./settings-context";
import { HexMapToolbar } from "./toolbar";

function generateHexes(
  width: number,
  height: number,
  color: string,
  orientation: "flat" | "pointy" = "flat"
) {
  const hexes: { q: number; r: number; color: string }[] = [];
  if (orientation === "flat") {
    for (let col = 0; col < width; col++) {
      for (let row = 0; row < height; row++) {
        const q = col;
        const r = row - Math.floor(col / 2);
        hexes.push({ q, r, color });
      }
    }
  } else {
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const q = col - Math.floor(row / 2);
        const r = row;
        hexes.push({ q, r, color });
      }
    }
  }
  return hexes;
}

function getHexNeighbors(q: number, r: number) {
  const directions = [
    [+1, 0],
    [0, +1],
    [-1, +1],
    [-1, 0],
    [0, -1],
    [+1, -1],
  ];
  return directions.map(([dq, dr]) => ({ q: q + dq, r: r + dr }));
}

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
};

const HexMapCanvasInner: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const [hexes, setHexes] = useState<HexCell[]>(() =>
    generateHexes(7, 7, "#e0e0e0", "flat")
  );
  const [history, setHistory] = useState<HexCell[][]>([]);
  const [redoStack, setRedoStack] = useState<HexCell[][]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartHexes, setDragStartHexes] = useState<HexCell[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importErrorOpen, setImportErrorOpen] = useState(false);
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

  const size = 30 * zoom;

  const handleUndo = () => {
    if (history.length === 0) return;
    setRedoStack((prev) => [hexes, ...prev]);
    const prevState = history[history.length - 1];
    setHexes(prevState);
    setHistory((h) => h.slice(0, h.length - 1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    setHistory((prev) => [...prev, hexes]);
    const nextState = redoStack[0];
    setHexes(nextState);
    setRedoStack((r) => r.slice(1));
  };

  const pushHistory = (newHexes: HexCell[]) => {
    setHistory((prev) => [...prev, hexes]);
    setRedoStack([]);
    setHexes(newHexes);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.3));
  const handleZoomReset = () => setZoom(1);

  const applyToolToHex = (q: number, r: number, currentHexes: HexCell[]) => {
    if (activeTool === "erase") {
      return currentHexes.map((hex) =>
        hex.q === q && hex.r === r
          ? { ...hex, color: baseFill, stroke, strokeWidth, stamp: undefined }
          : hex
      );
    }
    if (activeTool === "paint") {
      return currentHexes.map((hex) =>
        hex.q === q && hex.r === r
          ? {
              ...hex,
              color: brushColor,
              stroke: brushStroke,
              strokeWidth: brushStrokeWidth,
              stamp:
                selectedStamp === "No Stamp" ? undefined : selectedStamp,
            }
          : hex
      );
    }
    return currentHexes;
  };

  const handleHexClick = (q: number, r: number) => {
    if (activeTool === "erase") {
      const newHexes = hexes.map((hex) =>
        hex.q === q && hex.r === r
          ? { ...hex, color: baseFill, stroke, strokeWidth, stamp: undefined }
          : hex
      );
      pushHistory(newHexes);
      return;
    }
    if (activeTool === "eyedrop") {
      const hex = hexes.find((h) => h.q === q && h.r === r);
      if (hex) {
        setBrushColor(hex.color);
        if ("stroke" in hex && typeof hex.stroke === "string")
          setBrushStroke(hex.stroke);
        if ("strokeWidth" in hex && typeof hex.strokeWidth === "number")
          setBrushStrokeWidth(hex.strokeWidth);
        setSelectedStamp(
          "stamp" in hex && typeof hex.stamp === "string"
            ? hex.stamp
            : "No Stamp"
        );
      }
      setActiveTool("paint");
      return;
    }
    if (activeTool === "paint") {
      const newHexes = hexes.map((hex) =>
        hex.q === q && hex.r === r
          ? {
              ...hex,
              color: brushColor,
              stroke: brushStroke,
              strokeWidth: brushStrokeWidth,
              stamp:
                selectedStamp === "No Stamp" ? undefined : selectedStamp,
            }
          : hex
      );
      pushHistory(newHexes);
      return;
    }
    if (activeTool === "bucket") {
      const clicked = hexes.find((h) => h.q === q && h.r === r);
      if (!clicked) return;
      const targetColor = "color" in clicked ? clicked.color : undefined;
      const targetStroke =
        "stroke" in clicked && typeof clicked.stroke === "string"
          ? clicked.stroke
          : stroke;
      const targetStrokeWidth =
        "strokeWidth" in clicked && typeof clicked.strokeWidth === "number"
          ? clicked.strokeWidth
          : strokeWidth;
      const targetStamp =
        "stamp" in clicked && typeof clicked.stamp === "string"
          ? clicked.stamp
          : undefined;
      const match = (h: HexCell) =>
        h.color === targetColor &&
        (("stroke" in h && typeof h.stroke === "string" ? h.stroke : stroke) ===
          targetStroke) &&
        (("strokeWidth" in h && typeof h.strokeWidth === "number"
          ? h.strokeWidth
          : strokeWidth) === targetStrokeWidth) &&
        (("stamp" in h && typeof h.stamp === "string" ? h.stamp : undefined) ===
          targetStamp);
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
          const nkey = `${nq},${nr}`;
          if (!visited.has(nkey)) {
            const neighbor = hexes.find((h) => h.q === nq && h.r === nr);
            if (neighbor && match(neighbor)) {
              toFill.push({ q: nq, r: nr });
            }
          }
        });
      }
      const newHexes = hexes.map((hex) =>
        visited.has(`${hex.q},${hex.r}`)
          ? {
              ...hex,
              color: brushColor,
              stroke: brushStroke,
              strokeWidth: brushStrokeWidth,
              stamp:
                selectedStamp === "No Stamp" ? undefined : selectedStamp,
            }
          : hex
      );
      pushHistory(newHexes);
    }
  };

  const handleHexMouseDown = (q: number, r: number) => {
    if (activeTool === "paint" || activeTool === "erase") {
      setIsDragging(true);
      setDragStartHexes(hexes);
      const newHexes = applyToolToHex(q, r, hexes);
      setHexes(newHexes);
    }
  };

  const handleHexMouseEnter = (q: number, r: number) => {
    if (isDragging && (activeTool === "paint" || activeTool === "erase")) {
      const newHexes = applyToolToHex(q, r, hexes);
      setHexes(newHexes);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStartHexes) {
      setHistory((prev) => [...prev, dragStartHexes]);
      setRedoStack([]);
      setIsDragging(false);
      setDragStartHexes(null);
    }
  };

  const handleExport = () => {
    const data = exportHexGridV1({
      hexes,
      stroke,
      strokeWidth,
      spacing,
      orientation,
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hexgrid.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const imported = importHexGrid(json);
        setHexes(imported.hexes as HexCell[]);
        if (imported.hexes.length > 0) {
          const qs = (imported.hexes as HexCell[]).map((h) => h.q);
          const minQ = Math.min(...qs);
          const maxQ = Math.max(...qs);
          setWidth(maxQ - minQ + 1);
          const rowsPerCol: Record<number, Set<number>> = {};
          (imported.hexes as HexCell[]).forEach((h) => {
            const col = h.q;
            const row = h.r + Math.floor(col / 2);
            if (!rowsPerCol[col]) rowsPerCol[col] = new Set();
            rowsPerCol[col].add(row);
          });
          const h = Math.max(
            ...Object.values(rowsPerCol).map((set) => set.size)
          );
          setHeight(h);
        }
        setStroke(imported.stroke);
        setStrokeWidth(imported.strokeWidth);
        setSpacing(imported.spacing);
        if (imported.orientation === "pointy" || imported.orientation === "flat") {
          setOrientation(imported.orientation);
        }
      } catch {
        setImportErrorOpen(true);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleClear = () => {
    setHexes(generateHexes(width, height, baseFill, orientation));
  };

  useEffect(() => {
    setHexes((prev) => {
      const prevMap = new Map(prev.map((hex) => [`${hex.q},${hex.r}`, hex]));
      const newHexes: HexCell[] = [];
      if (orientation === "flat") {
        for (let col = 0; col < width; col++) {
          for (let row = 0; row < height; row++) {
            const q = col;
            const r = row - Math.floor(col / 2);
            const key = `${q},${r}`;
            const prevHex = prevMap.get(key);
            newHexes.push(
              prevHex ? { ...prevHex } : { q, r, color: "#e0e0e0" }
            );
          }
        }
      } else {
        for (let row = 0; row < height; row++) {
          for (let col = 0; col < width; col++) {
            const q = col - Math.floor(row / 2);
            const r = row;
            const key = `${q},${r}`;
            const prevHex = prevMap.get(key);
            newHexes.push(
              prevHex ? { ...prevHex } : { q, r, color: "#e0e0e0" }
            );
          }
        }
      }
      return newHexes;
    });
  }, [width, height, orientation]);

  return (
    <div className="flex h-full w-full min-h-0 flex-col gap-2">
      <AlertDialog open={importErrorOpen} onOpenChange={setImportErrorOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Could not import file</AlertDialogTitle>
            <AlertDialogDescription>
              The file must be valid JSON in the hex map export format (version
              1).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex w-full shrink-0 justify-center">
        <HexMapToolbar
          handleExport={handleExport}
          handleImportClick={handleImportClick}
          handleClear={handleClear}
          zoom={zoom}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
          handleZoomReset={handleZoomReset}
          handleUndo={handleUndo}
          handleRedo={handleRedo}
          canUndo={history.length > 0}
          canRedo={redoStack.length > 0}
        />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImport}
      />
      <div
        className="bg-card flex min-h-0 flex-1 rounded-lg border"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <HexGrid
          hexes={hexes}
          size={size}
          orientation={orientation}
          spacing={spacing}
          strokeWidth={strokeWidth}
          stroke={stroke}
          onHexClick={handleHexClick}
          onHexMouseDown={handleHexMouseDown}
          onHexMouseEnter={handleHexMouseEnter}
          stampIcons={STAMP_ICONS}
        />
      </div>
    </div>
  );
};
