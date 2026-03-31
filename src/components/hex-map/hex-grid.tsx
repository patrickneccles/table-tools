"use client";

import { useMemo, type FC } from "react";
import { useHexMapSettings } from "./settings-context";
import { Hex } from "./hex";

interface HexData {
  q: number;
  r: number;
  color: string;
  strokeWidth?: number;
  stroke?: string;
  stamp?: string;
}

interface HexGridProps {
  hexes: HexData[];
  size?: number;
  orientation?: "flat" | "pointy";
  spacing?: number;
  strokeWidth?: number;
  stroke?: string;
  onHexClick?: (q: number, r: number) => void;
  onHexMouseDown?: (q: number, r: number) => void;
  onHexMouseEnter?: (q: number, r: number) => void;
  stampIcons?: {
    name: string;
    icon: React.ComponentType<{ size?: number }>;
  }[];
}

function hexToPixel(
  q: number,
  r: number,
  size: number,
  orientation: "flat" | "pointy",
  spacing: number
) {
  const effectiveSize = size + spacing / 2;
  if (orientation === "flat") {
    const x = effectiveSize * (3 / 2) * q;
    const y = effectiveSize * Math.sqrt(3) * (r + q / 2);
    return { x, y };
  }
  const x = effectiveSize * Math.sqrt(3) * (q + r / 2);
  const y = effectiveSize * (3 / 2) * r;
  return { x, y };
}

export const HexGrid: FC<HexGridProps> = ({
  hexes,
  size,
  orientation,
  spacing,
  strokeWidth,
  stroke,
  onHexClick,
  onHexMouseDown,
  onHexMouseEnter,
  stampIcons = [],
}) => {
  const ctx = useHexMapSettings();
  const finalSize = size ?? 20;
  const finalOrientation = orientation ?? ctx.orientation;
  const finalSpacing = spacing ?? ctx.spacing;
  const finalStrokeWidth = strokeWidth ?? ctx.strokeWidth;
  const finalStroke = stroke ?? ctx.stroke;

  const positions = hexes.map(({ q, r }) =>
    hexToPixel(q, r, finalSize, finalOrientation, finalSpacing)
  );
  const xs = positions.map((p) => p.x);
  const ys = positions.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const pad = (finalSize + finalSpacing) * 2;
  const width = Math.max(400, maxX - minX + pad * 2);
  const height = Math.max(400, maxY - minY + pad * 2);

  const hexesSortedByStrokeWidth = useMemo(
    () =>
      [...hexes].sort(
        (a, b) => (a.strokeWidth ?? 0) - (b.strokeWidth ?? 0)
      ),
    [hexes]
  );

  return (
    <div className="overflow-auto" style={{ width: "100%", height: "100%" }}>
      <svg width={width} height={height} style={{ width: "100%", height: "100%" }}>
        {hexesSortedByStrokeWidth.map((hex) => {
          const { x, y } = hexToPixel(
            hex.q,
            hex.r,
            finalSize,
            finalOrientation,
            finalSpacing
          );
          const StampIcon = hex.stamp
            ? stampIcons.find((s) => s.name === hex.stamp)?.icon
            : undefined;
          return (
            <Hex
              key={`hex-${hex.q}-${hex.r}`}
              {...hex}
              size={finalSize}
              orientation={finalOrientation}
              centerX={x - minX + pad}
              centerY={y - minY + pad}
              strokeWidth={hex.strokeWidth ?? finalStrokeWidth}
              stroke={hex.stroke ?? finalStroke}
              onClick={onHexClick ? () => onHexClick(hex.q, hex.r) : undefined}
              onMouseDown={
                onHexMouseDown ? () => onHexMouseDown(hex.q, hex.r) : undefined
              }
              onMouseEnter={
                onHexMouseEnter
                  ? () => onHexMouseEnter(hex.q, hex.r)
                  : undefined
              }
              customStyle={onHexClick ? { cursor: "crosshair" } : undefined}
              stampIcon={StampIcon}
            />
          );
        })}
      </svg>
    </div>
  );
};
