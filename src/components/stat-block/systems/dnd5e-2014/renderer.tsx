/**
 * DnD5e2014Renderer.tsx
 * Renders a D&D 5e 2014 edition stat block in the classic style
 */

"use client";

import { cn } from "@/lib/utils";
import React from "react";
import type { DnD5e2014Data, TraitEntry } from "./types";
import { ABILITY_KEYS, calculateModifier, formatModifier } from "./types";

// ============================================================================
// Internal Sub-Components
// ============================================================================

/** Tapered divider line SVG (from D&D Beyond) */
function TaperedDivider() {
  return (
    <svg viewBox="0 0 226.08 4" className="w-full h-[4px] my-2" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path fill="#822000" d="M0,4 C5.76,3 226.08,1.5 226.08,1.5 S5.76,1 0,0 Z" />
    </svg>
  );
}

/** Decorative amber textured bar with black borders */
function DecorativeBar() {
  return (
    <div className="h-2 border-t border-b border-black" style={{
      background: "linear-gradient(135deg, #d4a574 0%, #c9934a 25%, #e6c896 50%, #b8884a 75%, #d4a574 100%)"
    }} />
  );
}

/** Renders a labeled stat line (e.g., "Armor Class 15") */
function StatLine({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p style={{ color: "#822000" }}>
      <span className="font-bold">{label}</span> {children}
    </p>
  );
}

/** Renders a single trait entry with bold italic name */
function TraitItem({ trait }: { trait: TraitEntry }) {
  return (
    <p className="text-stone-900">
      <span className="font-bold italic">{trait.name}.</span>{" "}
      <span className="whitespace-pre-wrap">{trait.description}</span>
    </p>
  );
}

/** Renders a section of traits/actions with optional heading */
function TraitSection({
  title,
  entries,
  showHeading = true
}: {
  title: string;
  entries: TraitEntry[] | undefined;
  showHeading?: boolean;
}) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="space-y-2">
      {showHeading && (
        <>
          <h3 className="text-lg font-bold tracking-wide border-b border-solid" style={{
            borderColor: "#822000",
            color: "#822000",
            fontVariant: "small-caps"
          }}>
            {title}
          </h3>
        </>
      )}
      <div className="space-y-2 text-sm">
        {entries.map((entry, i) => (
          <TraitItem key={i} trait={entry} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function DnD5e2014Renderer({
  data,
  className,
}: {
  data: DnD5e2014Data;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-amber-50 shadow-lg font-serif text-stone-900 max-w-md",
        className
      )}
    >
      {/* Decorative top bar */}
      <DecorativeBar />

      <div className="p-4 space-y-3">
        {/* Name & Type */}
        <div>
          <h2 className="text-2xl font-bold" style={{
            color: "#822000",
            fontVariant: "small-caps"
          }}>
            {data.name}
          </h2>
          <p className="text-sm italic">
            {data.size} {data.type}, {data.alignment}
          </p>
        </div>

        <TaperedDivider />

        {/* Combat Stats */}
        <div className="space-y-1 text-sm">
          <StatLine label="Armor Class">
            {data.armorClass}{data.armorType && ` (${data.armorType})`}
          </StatLine>
          <StatLine label="Hit Points">
            {data.hitPoints} ({data.hitDice})
          </StatLine>
          <StatLine label="Speed">{data.speed}</StatLine>
        </div>

        <TaperedDivider />

        {/* Ability Scores - 2014 single row */}
        <div
          className="grid grid-cols-6 gap-2 text-center text-sm"
          style={{ color: "#822000" }}
        >
          {ABILITY_KEYS.map((key) => {
            const value = data.abilities?.[key] ?? 10;
            const mod = calculateModifier(value);
            return (
              <div key={key}>
                <div className="font-bold">{key.toUpperCase()}</div>
                <div>{value} ({formatModifier(mod)})</div>
              </div>
            );
          })}
        </div>

        <TaperedDivider />

        {/* Proficiencies & Senses */}
        <div className="space-y-1 text-sm">
          {data.savingThrows && data.savingThrows.length > 0 && (
            <StatLine label="Saving Throws">{data.savingThrows.join(", ")}</StatLine>
          )}
          {data.skills && data.skills.length > 0 && (
            <StatLine label="Skills">{data.skills.join(", ")}</StatLine>
          )}
          {data.damageVulnerabilities && (
            <StatLine label="Damage Vulnerabilities">{data.damageVulnerabilities}</StatLine>
          )}
          {data.damageResistances && (
            <StatLine label="Damage Resistances">{data.damageResistances}</StatLine>
          )}
          {data.damageImmunities && (
            <StatLine label="Damage Immunities">{data.damageImmunities}</StatLine>
          )}
          {data.conditionImmunities && (
            <StatLine label="Condition Immunities">{data.conditionImmunities}</StatLine>
          )}
          {data.senses && <StatLine label="Senses">{data.senses}</StatLine>}
          {data.languages && <StatLine label="Languages">{data.languages}</StatLine>}
          <StatLine label="Challenge">
            {data.challengeRating}
            {data.experiencePoints && ` (${data.experiencePoints.toLocaleString()} XP)`}
          </StatLine>
        </div>

        <TaperedDivider />


        {/* Traits (no heading) */}
        <TraitSection title="Traits" entries={data.traits} showHeading={false} />

        {/* Actions sections */}
        <TraitSection title="Actions" entries={data.actions} />
        <TraitSection title="Bonus Actions" entries={data.bonusActions} />
        <TraitSection title="Reactions" entries={data.reactions} />

        {/* Legendary Actions (if any) */}
        {data.legendaryActions && data.legendaryActions.length > 0 && (
          <TraitSection title="Legendary Actions" entries={data.legendaryActions} />
        )}
      </div>

      {/* Decorative bottom bar */}
      <DecorativeBar />
    </div>
  );
}
