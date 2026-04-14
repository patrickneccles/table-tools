'use client';

import { useMemo, type FC, type RefObject } from 'react';
import { useHexMapSettings } from './settings-context';
import { Hex } from './hex';

interface HexData {
  q: number;
  r: number;
  color: string;
  strokeWidth?: number;
  stroke?: string;
  stamp?: string;
  label?: string;
}

interface HexGridProps {
  hexes: HexData[];
  size?: number;
  orientation?: 'flat' | 'pointy';
  spacing?: number;
  strokeWidth?: number;
  stroke?: string;
  isDragging?: boolean;
  onHexClick?: (q: number, r: number) => void;
  onHexPointerDown?: (q: number, r: number) => void;
  onHexPointerEnter?: (q: number, r: number) => void;
  stampIcons?: {
    name: string;
    icon: React.ComponentType<{ size?: number }>;
  }[];
  editingHex?: { q: number; r: number } | null;
  editingLabel?: string;
  onEditingLabelChange?: (v: string) => void;
  onEditingConfirm?: () => void;
  onEditingCancel?: () => void;
  svgRef?: RefObject<SVGSVGElement | null>;
}

function hexToPixel(
  q: number,
  r: number,
  size: number,
  orientation: 'flat' | 'pointy',
  spacing: number
) {
  const effectiveSize = size + spacing / 2;
  if (orientation === 'flat') {
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
  isDragging,
  onHexClick,
  onHexPointerDown,
  onHexPointerEnter,
  stampIcons = [],
  editingHex,
  editingLabel,
  onEditingLabelChange,
  onEditingConfirm,
  onEditingCancel,
  svgRef,
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
    () => [...hexes].sort((a, b) => (a.strokeWidth ?? 0) - (b.strokeWidth ?? 0)),
    [hexes]
  );

  return (
    <div className="h-full w-full overflow-auto">
      <div className="flex min-h-full min-w-full items-center justify-center p-4">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{ touchAction: 'none' }}
          onPointerMove={(e) => {
            // Handle touch drag — pointer enter doesn't fire during touch, so we hit-test here
            if (!isDragging || e.pointerType === 'mouse') return;
            const el = document.elementFromPoint(e.clientX, e.clientY);
            const hexEl = el?.closest('[data-hex]');
            if (!hexEl) return;
            const q = Number(hexEl.getAttribute('data-q'));
            const r = Number(hexEl.getAttribute('data-r'));
            if (!isNaN(q) && !isNaN(r)) onHexPointerEnter?.(q, r);
          }}
        >
          {hexesSortedByStrokeWidth.map((hex) => {
            const { x, y } = hexToPixel(hex.q, hex.r, finalSize, finalOrientation, finalSpacing);
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
                onPointerDown={onHexPointerDown ? () => onHexPointerDown(hex.q, hex.r) : undefined}
                onPointerEnter={
                  onHexPointerEnter ? () => onHexPointerEnter(hex.q, hex.r) : undefined
                }
                customStyle={onHexClick ? { cursor: 'crosshair' } : undefined}
                stampIcon={StampIcon}
                label={hex.label}
              />
            );
          })}
          {editingHex &&
            (() => {
              const { x: ex, y: ey } = hexToPixel(
                editingHex.q,
                editingHex.r,
                finalSize,
                finalOrientation,
                finalSpacing
              );
              const cx = ex - minX + pad;
              const cy = ey - minY + pad;
              const fw = finalSize * 2.4;
              const fh = Math.max(22, finalSize * 0.55);
              return (
                <foreignObject
                  key="label-editor"
                  x={cx - fw / 2}
                  y={cy + finalSize * 0.18}
                  width={fw}
                  height={fh}
                >
                  <div style={{ width: '100%', height: '100%' }}>
                    <input
                      autoFocus
                      value={editingLabel ?? ''}
                      placeholder="Label…"
                      onChange={(e) => onEditingLabelChange?.(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          onEditingConfirm?.();
                        }
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          onEditingCancel?.();
                        }
                        e.stopPropagation();
                      }}
                      onBlur={() => onEditingConfirm?.()}
                      style={{
                        width: '100%',
                        height: '100%',
                        fontSize: Math.max(10, Math.round(finalSize * 0.32)),
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.95)',
                        border: '1.5px solid #6b7280',
                        borderRadius: '3px',
                        outline: 'none',
                        padding: '0 2px',
                        color: '#111',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </foreignObject>
              );
            })()}
        </svg>
      </div>
    </div>
  );
};
