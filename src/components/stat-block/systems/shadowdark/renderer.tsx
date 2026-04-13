/**
 * Shadowdark RPG Stat Block Renderer
 *
 * Renders stat blocks in the compact Shadowdark format with streamlined,
 * abbreviated statistics.
 */

import React from 'react';
import { MarkdownContent } from '@/components/ui/markdown-content';
import type { SystemRendererProps } from '../base-system';
import type { ShadowdarkData } from './types';
import { ABILITY_KEYS, ABILITY_LABELS, formatModifier } from './types';

export function ShadowdarkRenderer({ data }: SystemRendererProps<ShadowdarkData>) {
  // Safely access ability scores with fallback to 0
  const getAbilityScore = (key: (typeof ABILITY_KEYS)[number]): number => {
    return data.abilityScores?.[key] ?? 0;
  };

  return (
    <div className="relative rounded-none font-sans text-black bg-white max-w-2xs mx-auto p-4 space-y-2">
      {/* Monster Name */}
      <h1 className="text-center text-xl font-bold p-1 bg-black text-white uppercase">
        {data.name}
      </h1>

      {/* Description (italic) */}
      {data.description && (
        <p className="text-left italic text-sm leading-snug">{data.description}</p>
      )}

      {/* Dense stat block */}
      <div className="text-sm leading-relaxed">
        <p>
          <span className="font-bold">AC</span> {data.armorClass ?? 10},{' '}
          <span className="font-bold">HP</span> {data.hitPoints ?? 1},{' '}
          <span className="font-bold">ATK</span> {data.attack ?? 'none'},{' '}
          <span className="font-bold">MV</span> {data.movement ?? 'near'},{' '}
          {ABILITY_KEYS.map((key, idx) => (
            <React.Fragment key={key}>
              <span className="font-bold">{ABILITY_LABELS[key]}</span>{' '}
              {formatModifier(getAbilityScore(key))}
              {idx < ABILITY_KEYS.length - 1 ? ', ' : ''}
            </React.Fragment>
          ))}
          , <span className="font-bold">AL</span> {data.alignment ?? 'N'},{' '}
          <span className="font-bold">LV</span> {data.level ?? 1}
        </p>
      </div>

      {/* Features */}
      {data.features && (
        <MarkdownContent content={data.features} className="text-sm leading-snug" />
      )}
    </div>
  );
}
