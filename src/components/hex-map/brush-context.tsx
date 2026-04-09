'use client';

import React, { createContext, useContext, useState } from 'react';

export type HexMapTool = 'paint' | 'bucket' | 'eyedrop' | 'erase' | 'text';

export type HexMapBrushContextType = {
  activeTool: HexMapTool;
  setActiveTool: (v: HexMapTool) => void;
  brushColor: string;
  setBrushColor: (v: string) => void;
  brushStroke: string;
  setBrushStroke: (v: string) => void;
  brushStrokeWidth: number;
  setBrushStrokeWidth: (v: number) => void;
  selectedStamp: string;
  setSelectedStamp: (v: string) => void;
};

const HexMapBrushContext = createContext<HexMapBrushContextType | undefined>(undefined);

export function HexMapBrushProvider({ children }: { children: React.ReactNode }) {
  const [activeTool, setActiveTool] = useState<HexMapTool>('paint');
  const [brushColor, setBrushColor] = useState('#eab308');
  const [brushStroke, setBrushStroke] = useState('#000000');
  const [brushStrokeWidth, setBrushStrokeWidth] = useState(0);
  const [selectedStamp, setSelectedStamp] = useState('No Stamp');

  return (
    <HexMapBrushContext.Provider
      value={{
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
      }}
    >
      {children}
    </HexMapBrushContext.Provider>
  );
}

export function useHexMapBrush() {
  const ctx = useContext(HexMapBrushContext);
  if (!ctx) throw new Error('useHexMapBrush must be used within HexMapBrushProvider');
  return ctx;
}
