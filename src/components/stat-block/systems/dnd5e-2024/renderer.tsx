/**
 * D&D 5e 2024 Edition Stat Block Renderer
 *
 * Renders stat blocks in the updated 2024 style with:
 * - Explicit Initiative display
 * - Gear section
 * - Proficiency Bonus in CR line
 * - Updated ability score table layout
 */

'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { MarkdownContent } from '@/components/ui/markdown-content';
import type { DnD5e2024Data } from './types';
import {
  ABILITY_KEYS,
  calculateInitiative,
  calculateModifier,
  calculateProficiencyBonus,
  formatModifier,
} from './types';

// ============================================================================
// Internal Sub-Components
// ============================================================================

/** Renders a labeled stat line (e.g., "Armor Class 15") - RED for 2024 */
function StatLine({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p style={{ color: '#5b160c' }}>
      <span className="font-bold">{label}</span> {children}
    </p>
  );
}

/** Renders a named section with optional heading and markdown content */
function MarkdownSection({
  title,
  content,
  showHeading = true,
  preamble,
}: {
  title: string;
  content: string | undefined;
  showHeading?: boolean;
  preamble?: string;
}) {
  if (!content && !preamble) return null;
  return (
    <div className="space-y-1 leading-normal">
      {showHeading && (
        <h3
          className="text-lg font-bold border-b border-solid"
          style={{ borderColor: '#5b160c', color: '#5b160c', fontVariant: 'small-caps' }}
        >
          {title}
        </h3>
      )}
      {preamble && <p className="text-sm italic text-stone-500">{preamble}</p>}
      {content && <MarkdownContent content={content} className="text-sm text-stone-900" />}
    </div>
  );
}

// ============================================================================
// Main Renderer Component
// ============================================================================

export type DnD5e2024RendererProps = {
  data: DnD5e2024Data;
  className?: string;
};

export function DnD5e2024Renderer({ data, className }: DnD5e2024RendererProps) {
  // Calculate initiative if not provided
  const dexScore = data.abilityScores?.dex ?? 10;
  const initiative = data.initiative ?? calculateInitiative(dexScore).modifier;
  const initiativeScore = 10 + initiative;

  // Calculate proficiency bonus if not provided
  const proficiencyBonus = data.proficiencyBonus ?? calculateProficiencyBonus(data.challengeRating);

  return (
    <div
      className={cn(
        'bg-white shadow-lg rounded-md',
        'font-sans text-stone-900 max-w-md',
        className
      )}
      style={{
        border: '3px double #64748b',
      }}
    >
      <div className="bg-yellow-100/10 p-4 space-y-3">
        {/* Name & Type */}
        <div>
          <h2
            className="text-2xl font-bold border-b border-solid"
            style={{
              color: '#5b160c',
              borderColor: '#5b160c',
              fontVariant: 'small-caps',
            }}
          >
            {data.name}
          </h2>
          <p className="text-sm italic text-stone-500 mt-1">
            {data.size} {data.type}, {data.alignment}
          </p>
        </div>

        {/* Combat Highlights - 2024 style with Initiative */}
        <div className="text-sm" style={{ color: '#5b160c' }}>
          <div className="grid grid-cols-2 gap-4">
            <p>
              <span className="font-bold">AC</span> {data.armorClass}
            </p>
            <p>
              <span className="font-bold">Initiative</span> {formatModifier(initiative)} (
              {initiativeScore})
            </p>
          </div>
          <p>
            <span className="font-bold">HP</span> {data.hitPoints} ({data.hitDice})
          </p>
          <p>
            <span className="font-bold">Speed</span> {data.speed}
          </p>
        </div>

        {/* Ability Scores - 2024 physical/mental split in 3 columns */}
        <div className="space-y-1">
          {/* Physical Stats: STR | DEX | CON */}
          <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-sm" style={{ color: '#5b160c' }}>
            {ABILITY_KEYS.map((key) => {
              const value = data.abilityScores?.[key] ?? 10;
              const mod = calculateModifier(value);
              const customSave = data.savingThrows?.find((s) => s.toLowerCase().startsWith(key));
              const save = customSave ? customSave.split(/\s+/)[1] : formatModifier(mod);
              const isPhysical = ['str', 'dex', 'con'].includes(key);
              return (
                <div key={key} className="grid grid-cols-2">
                  {/* Label and Score row */}
                  <div
                    className={cn(
                      'grid grid-cols-2 text-center',
                      isPhysical ? 'bg-yellow-600/15' : 'bg-emerald-900/15'
                    )}
                  >
                    <span className="font-bold p-1">{key.toUpperCase()}</span>
                    <span className="p-1">{value}</span>
                  </div>
                  {/* MOD/SAVE labels */}
                  {/* <div className="flex gap-1 text-[9px] text-stone-400 text-center mb-[2px]">
                    <div className="flex-1">MOD</div>
                    <div className="flex-1">SAVE</div>
                  </div> */}
                  {/* MOD/SAVE values */}
                  <div
                    className={cn(
                      'grid grid-cols-2 text-center',
                      isPhysical ? 'bg-orange-900/15' : 'bg-indigo-900/15'
                    )}
                  >
                    <div className="p-1">{formatModifier(mod)}</div>
                    <div className="p-1">{save}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Other Details - 2024 style */}
        <div className="space-y-1 text-sm">
          {data.skills && data.skills.length > 0 && (
            <StatLine label="Skills">{data.skills.join(', ')}</StatLine>
          )}
          {data.resistances && <StatLine label="Resistances">{data.resistances}</StatLine>}
          {data.vulnerabilities && (
            <StatLine label="Vulnerabilities">{data.vulnerabilities}</StatLine>
          )}
          {data.immunities && <StatLine label="Immunities">{data.immunities}</StatLine>}
          {data.gear && <StatLine label="Gear">{data.gear}</StatLine>}
          {data.senses && <StatLine label="Senses">{data.senses}</StatLine>}
          {data.languages && <StatLine label="Languages">{data.languages}</StatLine>}
          <StatLine label="CR">
            {data.challengeRating}
            {data.experiencePoints &&
              ` (XP ${data.experiencePoints.toLocaleString()}; PB ${formatModifier(proficiencyBonus)})`}
          </StatLine>
        </div>

        {/* Trait/action sections */}
        <MarkdownSection title="Traits" content={data.traits} />
        <MarkdownSection title="Actions" content={data.actions} />
        <MarkdownSection title="Bonus Actions" content={data.bonusActions} />
        <MarkdownSection title="Reactions" content={data.reactions} />
        <MarkdownSection
          title="Legendary Actions"
          content={data.legendaryActions}
          preamble={data.legendaryActionsPreamble}
        />

        {/* Description/Lore */}
        {data.description && (
          <div className="pt-2">
            <p className="text-sm italic text-stone-600">{data.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
