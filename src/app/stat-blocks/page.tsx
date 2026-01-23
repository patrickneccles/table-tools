"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Printer, Scroll } from "lucide-react";
import {
  StatBlockView,
  TraitEditor,
  EditorCard,
  TextInput,
  NumberInput,
  defaultStatBlock,
  ABILITY_KEYS,
  TRAIT_SECTION_KEYS,
} from "@/components/stat-block";
import type { StatBlockData, TraitSectionKey, AbilityKey } from "@/components/stat-block";

// ============================================================================
// Custom Hooks
// ============================================================================

function useStatBlockEditor(initialData: StatBlockData) {
  const [statBlock, setStatBlock] = useState<StatBlockData>(initialData);

  const updateField = useCallback(<K extends keyof StatBlockData>(
    field: K,
    value: StatBlockData[K]
  ) => {
    setStatBlock((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateAbility = useCallback((ability: AbilityKey, value: number) => {
    setStatBlock((prev) => ({
      ...prev,
      abilities: { ...prev.abilities, [ability]: value },
    }));
  }, []);

  const addTrait = useCallback((section: TraitSectionKey) => {
    setStatBlock((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), { name: "New Entry", description: "Description here..." }],
    }));
  }, []);

  const updateTrait = useCallback((
    section: TraitSectionKey,
    index: number,
    field: "name" | "description",
    value: string
  ) => {
    setStatBlock((prev) => {
      const current = [...(prev[section] || [])];
      current[index] = { ...current[index], [field]: value };
      return { ...prev, [section]: current };
    });
  }, []);

  const removeTrait = useCallback((section: TraitSectionKey, index: number) => {
    setStatBlock((prev) => {
      const current = [...(prev[section] || [])];
      current.splice(index, 1);
      return { ...prev, [section]: current };
    });
  }, []);

  return {
    statBlock,
    updateField,
    updateAbility,
    addTrait,
    updateTrait,
    removeTrait,
  };
}

// ============================================================================
// Page Component
// ============================================================================

export default function StatBlocksPage() {
  const {
    statBlock,
    updateField,
    updateAbility,
    addTrait,
    updateTrait,
    removeTrait,
  } = useStatBlockEditor(defaultStatBlock);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 print:bg-white print:min-h-0">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-900/20 text-amber-500">
                <Scroll className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Stat Block Generator</h1>
                <p className="text-zinc-500 text-sm">Create D&D 5e stat blocks</p>
              </div>
            </div>
          </div>
          <Button onClick={handlePrint} className="bg-amber-600 hover:bg-amber-500 text-white">
            <Printer className="h-4 w-4 mr-2" />
            Print / Save PDF
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6 print:p-0 print:max-w-none">
        <div className="flex flex-col lg:flex-row gap-8 print:block">
          {/* Editor Panel */}
          <div className="flex-1 print:hidden">
            <ScrollArea className="h-[calc(100vh-140px)] pr-4">
              <div className="space-y-4">
                {/* Basic Info */}
                <EditorCard title="Basic Information">
                  <div className="grid grid-cols-2 gap-3">
                    <TextInput
                      id="name"
                      label="Name"
                      value={statBlock.name}
                      onChange={(v) => updateField("name", v)}
                      className="col-span-2"
                    />
                    <TextInput
                      id="size"
                      label="Size"
                      value={statBlock.size}
                      onChange={(v) => updateField("size", v)}
                    />
                    <TextInput
                      id="type"
                      label="Type"
                      value={statBlock.type}
                      onChange={(v) => updateField("type", v)}
                    />
                    <TextInput
                      id="alignment"
                      label="Alignment"
                      value={statBlock.alignment}
                      onChange={(v) => updateField("alignment", v)}
                      className="col-span-2"
                    />
                  </div>
                </EditorCard>

                {/* Combat Stats */}
                <EditorCard title="Combat Statistics">
                  <div className="grid grid-cols-2 gap-3">
                    <NumberInput
                      id="ac"
                      label="Armor Class"
                      value={statBlock.armorClass}
                      onChange={(v) => updateField("armorClass", v ?? 10)}
                    />
                    <TextInput
                      id="acType"
                      label="AC Type"
                      value={statBlock.armorType || ""}
                      onChange={(v) => updateField("armorType", v || undefined)}
                      placeholder="e.g., natural armor"
                    />
                    <NumberInput
                      id="hp"
                      label="Hit Points"
                      value={statBlock.hitPoints}
                      onChange={(v) => updateField("hitPoints", v ?? 1)}
                    />
                    <TextInput
                      id="hitDice"
                      label="Hit Dice"
                      value={statBlock.hitDice}
                      onChange={(v) => updateField("hitDice", v)}
                      placeholder="e.g., 4d8 + 4"
                    />
                    <TextInput
                      id="speed"
                      label="Speed"
                      value={statBlock.speed}
                      onChange={(v) => updateField("speed", v)}
                      className="col-span-2"
                    />
                  </div>
                </EditorCard>

                {/* Ability Scores */}
                <EditorCard title="Ability Scores">
                  <div className="grid grid-cols-6 gap-2">
                    {ABILITY_KEYS.map((ability) => (
                      <div key={ability} className="text-center">
                        <Label 
                          htmlFor={`ability-${ability}`}
                          className="text-[10px] uppercase text-zinc-500 font-semibold"
                        >
                          {ability}
                        </Label>
                        <Input
                          id={`ability-${ability}`}
                          type="number"
                          min={1}
                          max={30}
                          value={statBlock.abilities[ability]}
                          onChange={(e) => updateAbility(ability, parseInt(e.target.value) || 10)}
                          className="text-center bg-zinc-800/50 border-zinc-700 text-white h-9"
                        />
                      </div>
                    ))}
                  </div>
                </EditorCard>

                {/* Proficiencies & Senses */}
                <EditorCard title="Proficiencies & Senses">
                  <TextInput
                    id="saves"
                    label="Saving Throws"
                    value={statBlock.savingThrows?.join(", ") || ""}
                    onChange={(v) => updateField("savingThrows", v.split(",").map(s => s.trim()).filter(Boolean))}
                    placeholder="e.g., Int +5, Wis +4"
                  />
                  <TextInput
                    id="skills"
                    label="Skills"
                    value={statBlock.skills?.join(", ") || ""}
                    onChange={(v) => updateField("skills", v.split(",").map(s => s.trim()).filter(Boolean))}
                    placeholder="e.g., Arcana +5, Stealth +3"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <TextInput
                      id="senses"
                      label="Senses"
                      value={statBlock.senses || ""}
                      onChange={(v) => updateField("senses", v || undefined)}
                    />
                    <TextInput
                      id="languages"
                      label="Languages"
                      value={statBlock.languages || ""}
                      onChange={(v) => updateField("languages", v || undefined)}
                    />
                  </div>
                  <Separator className="bg-zinc-800" />
                  <div className="grid grid-cols-2 gap-3">
                    <TextInput
                      id="cr"
                      label="Challenge Rating"
                      value={statBlock.challengeRating}
                      onChange={(v) => updateField("challengeRating", v)}
                    />
                    <NumberInput
                      id="xp"
                      label="Experience Points"
                      value={statBlock.experiencePoints}
                      onChange={(v) => updateField("experiencePoints", v)}
                    />
                  </div>
                </EditorCard>

                {/* Trait Sections */}
                {TRAIT_SECTION_KEYS.map((section) => (
                  <TraitEditor
                    key={section}
                    section={section}
                    entries={statBlock[section]}
                    onAdd={() => addTrait(section)}
                    onUpdate={(index, field, value) => updateTrait(section, index, field, value)}
                    onRemove={(index) => removeTrait(section, index)}
                  />
                ))}

                {/* Description/Lore */}
                <EditorCard title="Description / Lore">
                  <Textarea
                    value={statBlock.description || ""}
                    onChange={(e) => updateField("description", e.target.value || undefined)}
                    placeholder="Background information, lore, or notes about this creature..."
                    rows={4}
                    className="bg-zinc-800/50 border-zinc-700 text-white resize-none placeholder:text-zinc-600"
                  />
                </EditorCard>
              </div>
            </ScrollArea>
          </div>

          {/* Preview Panel */}
          <div className="w-full lg:w-[420px] shrink-0 print:w-full">
            <div className="lg:sticky lg:top-[88px] print:relative print:top-0">
              <h2 className="text-sm font-medium text-zinc-500 mb-3 print:hidden">Preview</h2>
              <StatBlockView data={statBlock} className="print:shadow-none print:max-w-none" />
            </div>
          </div>
        </div>
      </main>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 0.5in;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
