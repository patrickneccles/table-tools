"use client";

import React from "react";
import { StatBlockData, calculateModifier, formatModifier } from "./types";
import { cn } from "@/lib/utils";

type StatBlockViewProps = {
  data: StatBlockData;
  className?: string;
};

export function StatBlockView({ data, className }: StatBlockViewProps) {
  const abilities = [
    { name: "STR", value: data.abilities.str },
    { name: "DEX", value: data.abilities.dex },
    { name: "CON", value: data.abilities.con },
    { name: "INT", value: data.abilities.int },
    { name: "WIS", value: data.abilities.wis },
    { name: "CHA", value: data.abilities.cha },
  ];

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
          <p>
            <span className="font-bold text-amber-900">Armor Class</span>{" "}
            {data.armorClass}
            {data.armorType && ` (${data.armorType})`}
          </p>
          <p>
            <span className="font-bold text-amber-900">Hit Points</span>{" "}
            {data.hitPoints} ({data.hitDice})
          </p>
          <p>
            <span className="font-bold text-amber-900">Speed</span> {data.speed}
          </p>
        </div>

        {/* Ability Scores */}
        <div className="border-b border-amber-800 pb-2">
          <div className="grid grid-cols-6 gap-1 text-center text-sm">
            {abilities.map(({ name, value }) => {
              const mod = calculateModifier(value);
              return (
                <div key={name}>
                  <div className="font-bold text-amber-900">{name}</div>
                  <div>
                    {value} ({formatModifier(mod)})
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Proficiencies */}
        <div className="border-b border-amber-800 pb-2 space-y-1 text-sm">
          {data.savingThrows && data.savingThrows.length > 0 && (
            <p>
              <span className="font-bold text-amber-900">Saving Throws</span>{" "}
              {data.savingThrows.join(", ")}
            </p>
          )}
          {data.skills && data.skills.length > 0 && (
            <p>
              <span className="font-bold text-amber-900">Skills</span>{" "}
              {data.skills.join(", ")}
            </p>
          )}
          {data.damageResistances && (
            <p>
              <span className="font-bold text-amber-900">Damage Resistances</span>{" "}
              {data.damageResistances}
            </p>
          )}
          {data.damageImmunities && (
            <p>
              <span className="font-bold text-amber-900">Damage Immunities</span>{" "}
              {data.damageImmunities}
            </p>
          )}
          {data.conditionImmunities && (
            <p>
              <span className="font-bold text-amber-900">Condition Immunities</span>{" "}
              {data.conditionImmunities}
            </p>
          )}
          {data.senses && (
            <p>
              <span className="font-bold text-amber-900">Senses</span>{" "}
              {data.senses}
            </p>
          )}
          {data.languages && (
            <p>
              <span className="font-bold text-amber-900">Languages</span>{" "}
              {data.languages}
            </p>
          )}
          <p>
            <span className="font-bold text-amber-900">Challenge</span>{" "}
            {data.challengeRating}
            {data.experiencePoints && ` (${data.experiencePoints.toLocaleString()} XP)`}
          </p>
        </div>

        {/* Traits */}
        {data.traits && data.traits.length > 0 && (
          <div className="space-y-2 text-sm">
            {data.traits.map((trait, i) => (
              <p key={i}>
                <span className="font-bold italic text-amber-900">{trait.name}.</span>{" "}
                <span className="whitespace-pre-wrap">{trait.description}</span>
              </p>
            ))}
          </div>
        )}

        {/* Actions */}
        {data.actions && data.actions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-amber-900 border-b border-amber-800">
              Actions
            </h3>
            <div className="space-y-2 text-sm">
              {data.actions.map((action, i) => (
                <p key={i}>
                  <span className="font-bold italic text-amber-900">{action.name}.</span>{" "}
                  <span className="whitespace-pre-wrap">{action.description}</span>
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Bonus Actions */}
        {data.bonusActions && data.bonusActions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-amber-900 border-b border-amber-800">
              Bonus Actions
            </h3>
            <div className="space-y-2 text-sm">
              {data.bonusActions.map((action, i) => (
                <p key={i}>
                  <span className="font-bold italic text-amber-900">{action.name}.</span>{" "}
                  <span className="whitespace-pre-wrap">{action.description}</span>
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Reactions */}
        {data.reactions && data.reactions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-amber-900 border-b border-amber-800">
              Reactions
            </h3>
            <div className="space-y-2 text-sm">
              {data.reactions.map((reaction, i) => (
                <p key={i}>
                  <span className="font-bold italic text-amber-900">{reaction.name}.</span>{" "}
                  <span className="whitespace-pre-wrap">{reaction.description}</span>
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Legendary Actions */}
        {data.legendaryActions && data.legendaryActions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-amber-900 border-b border-amber-800">
              Legendary Actions
            </h3>
            <div className="space-y-2 text-sm">
              {data.legendaryActions.map((action, i) => (
                <p key={i}>
                  <span className="font-bold italic text-amber-900">{action.name}.</span>{" "}
                  <span className="whitespace-pre-wrap">{action.description}</span>
                </p>
              ))}
            </div>
          </div>
        )}

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
