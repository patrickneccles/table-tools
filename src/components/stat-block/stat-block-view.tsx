"use client";

import React from "react";
import { 
  StatBlockData, 
  TraitEntry, 
  ABILITY_KEYS,
  calculateModifier, 
  formatModifier 
} from "./types";
import { cn } from "@/lib/utils";

// ============================================================================
// Internal Sub-Components
// ============================================================================

/** Renders a labeled stat line (e.g., "Armor Class 15") */
function StatLine({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p>
      <span className="font-bold text-amber-900">{label}</span> {children}
    </p>
  );
}

/** Renders a single trait entry with bold italic name */
function TraitItem({ trait }: { trait: TraitEntry }) {
  return (
    <p>
      <span className="font-bold italic text-amber-900">{trait.name}.</span>{" "}
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
        <h3 className="text-lg font-bold text-amber-900 border-b border-amber-800">
          {title}
        </h3>
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

type StatBlockViewProps = {
  data: StatBlockData;
  className?: string;
};

export function StatBlockView({ data, className }: StatBlockViewProps) {
  return (
    <div
      className={cn(
        "bg-amber-50 border-t-4 border-b-4 border-amber-900 shadow-lg",
        "font-serif text-stone-900 max-w-md",
        className
      )}
    >
      {/* Decorative top bar */}
      <div className="h-1 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900" />
      
      <div className="p-4 space-y-3">
        {/* Name & Type */}
        <div className="border-b-2 border-amber-900 pb-2">
          <h2 className="text-2xl font-bold text-amber-900">{data.name}</h2>
          <p className="text-sm italic">
            {data.size} {data.type}, {data.alignment}
          </p>
        </div>

        {/* Combat Stats */}
        <div className="border-b border-amber-800 pb-2 space-y-1 text-sm">
          <StatLine label="Armor Class">
            {data.armorClass}{data.armorType && ` (${data.armorType})`}
          </StatLine>
          <StatLine label="Hit Points">
            {data.hitPoints} ({data.hitDice})
          </StatLine>
          <StatLine label="Speed">{data.speed}</StatLine>
        </div>

        {/* Ability Scores */}
        <div className="border-b border-amber-800 pb-2">
          <div className="grid grid-cols-6 gap-1 text-center text-sm">
            {ABILITY_KEYS.map((key) => {
              const value = data.abilities[key];
              const mod = calculateModifier(value);
              return (
                <div key={key}>
                  <div className="font-bold text-amber-900">{key.toUpperCase()}</div>
                  <div>{value} ({formatModifier(mod)})</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Proficiencies & Senses */}
        <div className="border-b border-amber-800 pb-2 space-y-1 text-sm">
          {data.savingThrows && data.savingThrows.length > 0 && (
            <StatLine label="Saving Throws">{data.savingThrows.join(", ")}</StatLine>
          )}
          {data.skills && data.skills.length > 0 && (
            <StatLine label="Skills">{data.skills.join(", ")}</StatLine>
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

        {/* Traits (no heading) */}
        <TraitSection title="Traits" entries={data.traits} showHeading={false} />
        
        {/* Actions sections */}
        <TraitSection title="Actions" entries={data.actions} />
        <TraitSection title="Bonus Actions" entries={data.bonusActions} />
        <TraitSection title="Reactions" entries={data.reactions} />
        <TraitSection title="Legendary Actions" entries={data.legendaryActions} />

        {/* Description/Lore */}
        {data.description && (
          <div className="pt-2 border-t border-amber-800">
            <p className="text-sm italic text-stone-600">{data.description}</p>
          </div>
        )}
      </div>

      {/* Decorative bottom bar */}
      <div className="h-1 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900" />
    </div>
  );
}
