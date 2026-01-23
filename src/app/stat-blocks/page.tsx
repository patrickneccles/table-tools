"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Home, Printer, Scroll, FileText, Calculator, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  StatBlockView,
  TraitEditor,
  EditorCard,
  TextInput,
  NumberInput,
  defaultStatBlock,
  ABILITY_KEYS,
  TRAIT_SECTION_KEYS,
  STAT_BLOCK_TEMPLATES,
  getXPForCR,
  calculateAverageHP,
  calculateModifier,
  saveStatBlockToStorage,
  loadStatBlockFromStorage,
} from "@/components/stat-block";
import type { StatBlockData, TraitSectionKey, AbilityKey, StatBlockTemplate } from "@/components/stat-block";

// ============================================================================
// Custom Hooks
// ============================================================================

function useStatBlockEditor(initialData: StatBlockData) {
  const [statBlock, setStatBlock] = useState<StatBlockData>(initialData);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadStatBlockFromStorage();
    if (saved) {
      setStatBlock(saved);
    }
    isInitialMount.current = false;
  }, []);

  // Auto-save to localStorage with debounce
  useEffect(() => {
    if (isInitialMount.current) return;
    
    setSaveStatus("saving");
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveStatBlockToStorage(statBlock);
      setSaveStatus("saved");
      
      // Reset status after a delay
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [statBlock]);

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

  const loadTemplate = useCallback((template: StatBlockTemplate) => {
    setStatBlock({ ...template.data });
  }, []);

  const resetToDefault = useCallback(() => {
    setStatBlock({ ...defaultStatBlock });
  }, []);

  return {
    statBlock,
    saveStatus,
    updateField,
    updateAbility,
    addTrait,
    updateTrait,
    removeTrait,
    loadTemplate,
    resetToDefault,
    setStatBlock,
  };
}

// ============================================================================
// Template Selector Component
// ============================================================================

function TemplateSelector({ onSelect, isLightMode }: { onSelect: (template: StatBlockTemplate) => void; isLightMode: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            isLightMode
              ? "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800"
              : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          )}
        >
          <FileText className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Templates</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-80 p-0",
          isLightMode
            ? "bg-white border-zinc-200"
            : "bg-zinc-900 border-zinc-700"
        )} 
        align="start"
      >
        <div className={cn(
          "p-3 border-b",
          isLightMode ? "border-zinc-200" : "border-zinc-800"
        )}>
          <h3 className={cn(
            "font-medium text-sm",
            isLightMode ? "text-zinc-800" : "text-white"
          )}>Choose a Template</h3>
          <p className="text-xs text-zinc-500 mt-1">Start with a pre-built creature or blank slate</p>
        </div>
        <div className="p-2">
          {STAT_BLOCK_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                onSelect(template);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-2 py-2 rounded-md transition-colors",
                isLightMode ? "hover:bg-zinc-100" : "hover:bg-zinc-800"
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium",
                  isLightMode ? "text-zinc-700" : "text-zinc-200"
                )}>{template.name}</span>
                {template.isSRD && (
                  <span className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                    isLightMode
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-emerald-900/50 text-emerald-400 border-emerald-800/50"
                  )}>
                    SRD
                  </span>
                )}
              </div>
              <div className="text-xs text-zinc-500">{template.description}</div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// Save Status Indicator
// ============================================================================

function SaveStatusIndicator({ status }: { status: "idle" | "saving" | "saved" }) {
  if (status === "idle") return null;
  
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {status === "saving" && (
        <>
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-zinc-500">Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3 w-3 text-emerald-500" />
          <span className="text-zinc-500">Saved</span>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default function StatBlocksPage() {
  const {
    statBlock,
    saveStatus,
    updateField,
    updateAbility,
    addTrait,
    updateTrait,
    removeTrait,
    loadTemplate,
  } = useStatBlockEditor(defaultStatBlock);

  const [isLightMode, setIsLightMode] = useState(false);

  // Check for existing light mode preference on mount and listen for changes
  useEffect(() => {
    const isLight = document.documentElement.classList.contains("light");
    setIsLightMode(isLight);
    
    // Listen for theme changes from global toggle
    const observer = new MutationObserver(() => {
      setIsLightMode(document.documentElement.classList.contains("light"));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    return () => observer.disconnect();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Auto-calculate XP when CR changes
  const handleCRChange = (cr: string) => {
    updateField("challengeRating", cr);
    const xp = getXPForCR(cr);
    if (xp !== undefined) {
      updateField("experiencePoints", xp);
    }
  };

  // Calculate HP from hit dice
  const handleCalculateHP = () => {
    const hp = calculateAverageHP(statBlock.hitDice);
    if (hp !== null) {
      updateField("hitPoints", hp);
    }
  };

  // Check if HP matches calculated value
  const calculatedHP = calculateAverageHP(statBlock.hitDice);
  const hpMatchesCalculation = calculatedHP !== null && calculatedHP === statBlock.hitPoints;

  return (
    <div className={cn(
      "transition-colors duration-300 print:bg-white",
      isLightMode 
        ? "bg-gradient-to-b from-zinc-50 to-zinc-100" 
        : "bg-gradient-to-b from-zinc-900 to-zinc-950"
    )}>
      {/* Header */}
      <header className={cn(
        "border-b backdrop-blur-sm sticky top-0 z-50 print:hidden transition-colors",
        isLightMode
          ? "border-zinc-200 bg-white/80"
          : "border-zinc-800 bg-zinc-900/80"
      )}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              isLightMode ? "bg-amber-100 text-amber-600" : "bg-amber-900/20 text-amber-500"
            )}>
              <Scroll className="h-5 w-5" />
            </div>
            <div>
              <h1 className={cn(
                "text-xl font-bold transition-colors",
                isLightMode ? "text-zinc-800" : "text-white"
              )}>Stat Block Generator</h1>
              <p className="text-zinc-500 text-sm">Create D&D 5e stat blocks</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Home link */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "rounded-full text-xs",
                isLightMode
                  ? "bg-zinc-900/10 border border-zinc-900/10 text-zinc-600 hover:bg-zinc-900/20 hover:text-zinc-800"
                  : "bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
              )}
            >
              <Link href="/">
                <Home className="h-3 w-3" />
                <span className="hidden sm:inline ml-1">Home</span>
              </Link>
            </Button>
            <SaveStatusIndicator status={saveStatus} />
            <TemplateSelector onSelect={loadTemplate} isLightMode={isLightMode} />
            <Button onClick={handlePrint} className="bg-amber-600 hover:bg-amber-500 text-white">
              <Printer className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Print / Save PDF</span>
              <span className="sm:hidden">Print</span>
            </Button>
          </div>
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
                    <div>
                      <Label htmlFor="hp" className="text-zinc-400 text-xs">Hit Points</Label>
                      <div className="flex gap-2">
                        <Input
                          id="hp"
                          type="number"
                          value={statBlock.hitPoints}
                          onChange={(e) => updateField("hitPoints", parseInt(e.target.value) || 1)}
                          className="bg-zinc-800/50 border-zinc-700 text-white flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCalculateHP}
                          disabled={!statBlock.hitDice}
                          title={calculatedHP !== null ? `Calculate from dice: ${calculatedHP}` : "Enter hit dice first"}
                          className={`h-9 w-9 ${hpMatchesCalculation ? 'text-emerald-500' : 'text-zinc-400 hover:text-white'}`}
                        >
                          <Calculator className="h-4 w-4" />
                        </Button>
                      </div>
                      {calculatedHP !== null && !hpMatchesCalculation && (
                        <p className="text-xs text-amber-500 mt-1">
                          Calculated: {calculatedHP}
                        </p>
                      )}
                    </div>
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
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          {calculateModifier(statBlock.abilities[ability]) >= 0 ? "+" : ""}
                          {calculateModifier(statBlock.abilities[ability])}
                        </div>
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
                    <div>
                      <Label htmlFor="cr" className="text-zinc-400 text-xs">Challenge Rating</Label>
                      <Input
                        id="cr"
                        value={statBlock.challengeRating}
                        onChange={(e) => handleCRChange(e.target.value)}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="xp" className="text-zinc-400 text-xs">
                        Experience Points
                        {getXPForCR(statBlock.challengeRating) !== undefined && (
                          <span className="text-zinc-600 ml-1">
                            (CR {statBlock.challengeRating} = {getXPForCR(statBlock.challengeRating)?.toLocaleString()} XP)
                          </span>
                        )}
                      </Label>
                      <Input
                        id="xp"
                        type="number"
                        value={statBlock.experiencePoints ?? ""}
                        onChange={(e) => updateField("experiencePoints", parseInt(e.target.value) || undefined)}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                      />
                    </div>
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
                <EditorCard title="Description / Lore" defaultOpen={!!statBlock.description}>
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
