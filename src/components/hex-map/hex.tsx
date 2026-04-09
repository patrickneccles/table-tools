'use client';

import React from 'react';
import { useHexMapSettings } from './settings-context';

function hexagonPoints(
  centerX: number,
  centerY: number,
  size: number,
  orientation: 'flat' | 'pointy' = 'flat'
) {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = orientation === 'flat' ? 60 * i : 60 * i - 30;
    const angle_rad = (Math.PI / 180) * angle_deg;
    const x = centerX + size * Math.cos(angle_rad);
    const y = centerY + size * Math.sin(angle_rad);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

interface HexProps {
  q: number;
  r: number;
  color: string;
  size?: number;
  orientation?: 'flat' | 'pointy';
  centerX: number;
  centerY: number;
  strokeWidth?: number;
  stroke?: string;
  onClick?: () => void;
  onPointerDown?: () => void;
  onPointerEnter?: () => void;
  customStyle?: React.CSSProperties;
  stampIcon?: React.ComponentType<{ size?: number }>;
  label?: string;
}

export const Hex: React.FC<HexProps> = (props) => {
  const ctx = useHexMapSettings();
  const size = props.size ?? 20;
  const orientation = props.orientation ?? ctx.orientation ?? 'flat';
  const {
    q,
    r,
    color,
    centerX,
    centerY,
    strokeWidth: hexStrokeWidth = 2,
    stroke,
    onClick,
    onPointerDown,
    onPointerEnter,
    customStyle,
    stampIcon: StampIcon,
    label,
  } = props;
  return (
    <g data-hex="true" data-q={q} data-r={r}>
      <polygon
        points={hexagonPoints(centerX, centerY, size, orientation)}
        strokeWidth={hexStrokeWidth}
        style={{ fill: color, ...customStyle }}
        stroke={stroke}
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerEnter={onPointerEnter}
      />
      {StampIcon && (
        <g pointerEvents="none">
          <foreignObject
            x={centerX - size * 0.5}
            y={centerY - size * 0.5}
            width={size}
            height={size}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: '100%',
                height: '100%',
                color: stroke ?? '#333333',
              }}
            >
              <StampIcon size={size * 0.7} />
            </div>
          </foreignObject>
        </g>
      )}
      {label && (
        <text
          x={centerX}
          y={centerY + size * 0.4}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={Math.max(8, Math.round(size * 0.32))}
          fill={stroke ?? '#333333'}
          pointerEvents="none"
          style={{ userSelect: 'none' }}
        >
          {label}
        </text>
      )}
    </g>
  );
};
