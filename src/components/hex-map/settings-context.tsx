"use client";

import React, { createContext, useContext, useState } from "react";
import { PALETTES } from "./constants/palette";

export type HexMapSettings = {
  width: number;
  setWidth: (v: number) => void;
  height: number;
  setHeight: (v: number) => void;
  stroke: string;
  setStroke: (v: string) => void;
  strokeWidth: number;
  setStrokeWidth: (v: number) => void;
  spacing: number;
  setSpacing: (v: number) => void;
  orientation: "flat" | "pointy";
  setOrientation: (v: "flat" | "pointy") => void;
  baseFill: string;
  setBaseFill: (v: string) => void;
  palette: keyof typeof PALETTES;
  setPalette: (v: keyof typeof PALETTES) => void;
};

const HexMapSettingsContext = createContext<HexMapSettings | undefined>(
  undefined
);

export function HexMapSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [width, setWidth] = useState(7);
  const [height, setHeight] = useState(7);
  const [stroke, setStroke] = useState("#888888");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [spacing, setSpacing] = useState(2);
  const [orientation, setOrientation] = useState<"flat" | "pointy">("flat");
  const [baseFill, setBaseFill] = useState("#e0e0e0");
  const [palette, setPalette] = useState<keyof typeof PALETTES>("VIBRANT");

  return (
    <HexMapSettingsContext.Provider
      value={{
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
      }}
    >
      {children}
    </HexMapSettingsContext.Provider>
  );
}

export function useHexMapSettings() {
  const ctx = useContext(HexMapSettingsContext);
  if (!ctx)
    throw new Error("useHexMapSettings must be used within HexMapSettingsProvider");
  return ctx;
}
