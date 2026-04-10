'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Distribution } from '@/lib/dice-probability';
import { formatPct } from '@/lib/dice-probability';

const PAD = { top: 20, right: 16, bottom: 32, left: 42 };
const CHART_H = 220;
const BAR_COLOR = '#dc2626';
const BAR_COLOR_DIM = '#7f1d1d';

type Props = {
  distribution: Distribution;
  threshold?: number | null;
  thresholdMode?: 'over' | 'under'; // which side to dim
  isLightMode: boolean;
};

export function DistributionChart({
  distribution,
  threshold,
  thresholdMode = 'over',
  isLightMode,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width);
    });
    obs.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => obs.disconnect();
  }, []);

  const { min, probs } = distribution;
  const n = probs.length;
  if (n === 0) return null;

  const maxProb = Math.max(...probs);
  const innerW = width - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;

  const barW = innerW / n;
  const gap = Math.max(1, barW * 0.12);
  const effectiveW = Math.max(1, barW - gap);
  const radius = Math.min(3, effectiveW / 2);

  // Y-axis ticks: pick a step so we get 3–5 ticks
  const maxPct = maxProb * 100;
  const rawStep = maxPct / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const niceSteps = [1, 2, 2.5, 5, 10].map((s) => s * magnitude);
  const yStep = niceSteps.find((s) => maxPct / s <= 5) ?? niceSteps[niceSteps.length - 1];
  const yTicks: number[] = [];
  for (let t = yStep; t <= maxPct * 1.01; t += yStep) {
    yTicks.push(Math.round(t * 10) / 10);
  }

  // X-axis: show a label every N outcomes so they don't overlap
  const labelStep = n <= 20 ? 1 : n <= 40 ? 2 : n <= 60 ? 5 : 10;

  const toY = (p: number) => innerH - (p / maxProb) * innerH;
  const toBarX = (i: number) => i * barW + gap / 2;

  const gridColor = isLightMode ? '#e4e4e7' : '#27272a';
  const axisTextColor = isLightMode ? '#a1a1aa' : '#52525b';
  const axisLineColor = isLightMode ? '#d4d4d8' : '#3f3f46';

  const hoveredValue = hoveredIdx !== null ? min + hoveredIdx : null;
  const hoveredProb = hoveredIdx !== null ? probs[hoveredIdx] : null;

  return (
    <div ref={containerRef} className="w-full select-none">
      <svg
        width={width}
        height={CHART_H}
        style={{ display: 'block', overflow: 'visible' }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {/* Y-axis grid lines + labels */}
        {yTicks.map((tick) => {
          const y = PAD.top + toY(tick / 100);
          return (
            <g key={tick}>
              <line
                x1={PAD.left}
                y1={y}
                x2={PAD.left + innerW}
                y2={y}
                stroke={gridColor}
                strokeWidth={1}
              />
              <text
                x={PAD.left - 6}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={10}
                fill={axisTextColor}
              >
                {tick}%
              </text>
            </g>
          );
        })}

        {/* X-axis baseline */}
        <line
          x1={PAD.left}
          y1={PAD.top + innerH}
          x2={PAD.left + innerW}
          y2={PAD.top + innerH}
          stroke={axisLineColor}
          strokeWidth={1}
        />

        {/* Bars */}
        <g transform={`translate(${PAD.left}, ${PAD.top})`}>
          {probs.map((p, i) => {
            const value = min + i;
            const isHovered = hoveredIdx === i;
            const isDimmed =
              threshold != null &&
              (thresholdMode === 'over' ? value < threshold : value > threshold);

            const barH = (p / maxProb) * innerH;
            const x = toBarX(i);
            const y = innerH - barH;

            const fill = isHovered ? '#f87171' : isDimmed ? BAR_COLOR_DIM : BAR_COLOR;

            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={effectiveW}
                height={barH}
                fill={fill}
                rx={radius}
                ry={radius}
                onMouseEnter={() => setHoveredIdx(i)}
                style={{ cursor: 'default', transition: 'fill 80ms' }}
              />
            );
          })}

          {/* Hover label above hovered bar */}
          {hoveredIdx !== null && hoveredProb !== null && (
            <>
              <text
                x={toBarX(hoveredIdx) + effectiveW / 2}
                y={Math.max(0, toY(hoveredProb) - 14)}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill={BAR_COLOR}
              >
                {formatPct(hoveredProb)}
              </text>
              <text
                x={toBarX(hoveredIdx) + effectiveW / 2}
                y={Math.max(0, toY(hoveredProb) - 4)}
                textAnchor="middle"
                fontSize={9}
                fill={axisTextColor}
              >
                roll {hoveredValue}
              </text>
            </>
          )}
        </g>

        {/* X-axis labels */}
        <g transform={`translate(${PAD.left}, ${PAD.top + innerH + 5})`}>
          {probs.map((_, i) => {
            const isFirst = i === 0;
            const isLast = i === n - 1;
            const showLabel = isFirst || isLast || i % labelStep === 0;
            if (!showLabel) return null;
            const value = min + i;
            const x = toBarX(i) + effectiveW / 2;
            return (
              <text key={i} x={x} y={12} textAnchor="middle" fontSize={10} fill={axisTextColor}>
                {value}
              </text>
            );
          })}
        </g>
      </svg>

      {/* Hover info strip — keeps layout stable */}
      <div
        className={cn(
          'h-5 flex items-center justify-center text-xs transition-opacity',
          hoveredIdx !== null ? 'opacity-100' : 'opacity-0'
        )}
      >
        {hoveredIdx !== null && hoveredProb !== null && (
          <span className={isLightMode ? 'text-zinc-500' : 'text-zinc-400'}>
            Rolling{' '}
            <span className={cn('font-semibold', isLightMode ? 'text-zinc-800' : 'text-zinc-100')}>
              {hoveredValue}
            </span>
            : exactly {formatPct(hoveredProb)}
          </span>
        )}
      </div>
    </div>
  );
}
