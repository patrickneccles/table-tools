"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Home, Printer, Scroll, FileText, Check, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SystemStatBlockView,
  SystemSelector,
  DEFAULT_SYSTEM_ID,
  getSystem,
  transformBetweenSystems,
  TraitEditor,
  DynamicEditor,
  TRAIT_SECTION_KEYS,
  STAT_BLOCK_TEMPLATES,
  saveStatBlockToStorage,
  loadStatBlockFromStorage,
  saveSystemToStorage,
  loadSystemFromStorage,
} from "@/components/stat-block";
import type { TraitSectionKey, AbilityKey, StatBlockTemplate, DnD5e2014Data, DnD5e2024Data, BaseStatBlockData } from "@/components/stat-block";
import { calculateInitiative, calculateProficiencyBonus } from "@/components/stat-block/systems/dnd5e-2024";

// Generic stat block data that can be any system's data
type AnyStatBlockData = BaseStatBlockData & Record<string, unknown>;

// Combined D&D 5e type that includes both 2014 and 2024 fields
type DnD5eData = (DnD5e2014Data | DnD5e2024Data) & Partial<{
  initiative: number;
  proficiencyBonus: number;
  gear: string[];
  resistances: string;
  vulnerabilities: string;
  immunities: string;
}>;

// ============================================================================
// Custom Hooks
// ============================================================================

function useStatBlockEditor<T extends AnyStatBlockData>(initialData: T) {
  // Always use initialData for consistent SSR
  const [statBlock, setStatBlock] = useState<T>(initialData);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Load from localStorage on client side only (after hydration)
  useEffect(() => {
    const saved = loadStatBlockFromStorage();
    if (saved) {
      // eslint-disable-next-line -- Intentional: loading from localStorage after hydration to avoid SSR mismatch
      setStatBlock(saved as unknown as T);
    }
    isInitialMount.current = false;
  }, []);

  // Auto-save to localStorage with debounce
  useEffect(() => {
    if (isInitialMount.current) return;

    // Intentional: update save status when statBlock changes for auto-save feedback
    // eslint-disable-next-line
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

  const updateField = useCallback(<K extends keyof T>(
    field: K,
    value: T[K]
  ) => {
    setStatBlock((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateAbility = useCallback((ability: AbilityKey, value: number) => {
    setStatBlock((prev) => {
      // Type guard for D&D 5e data with abilities field
      if ('abilities' in prev && typeof prev.abilities === 'object') {
        return {
          ...prev,
          abilities: { ...prev.abilities as Record<string, unknown>, [ability]: value },
        };
      }
      // For non-D&D 5e systems, check for abilityScores (Shadowdark style)
      if ('abilityScores' in prev && typeof prev.abilityScores === 'object') {
        return {
          ...prev,
          abilityScores: { ...prev.abilityScores as Record<string, unknown>, [ability]: value },
        };
      }
      return prev;
    });
  }, []);

  const addTrait = useCallback((section: TraitSectionKey) => {
    setStatBlock((prev) => {
      const sectionData = prev[section as keyof T];
      if (Array.isArray(sectionData)) {
        return {
          ...prev,
          [section]: [...sectionData, { name: "New Entry", description: "Description here..." }],
        };
      }
      return prev;
    });
  }, []);

  const updateTrait = useCallback((
    section: TraitSectionKey,
    index: number,
    field: "name" | "description",
    value: string
  ) => {
    setStatBlock((prev) => {
      const sectionData = prev[section as keyof T];
      if (Array.isArray(sectionData)) {
        const current = [...sectionData];
        current[index] = { ...current[index], [field]: value };
        return { ...prev, [section]: current };
      }
      return prev;
    });
  }, []);

  const removeTrait = useCallback((section: TraitSectionKey, index: number) => {
    setStatBlock((prev) => {
      const sectionData = prev[section as keyof T];
      if (Array.isArray(sectionData)) {
        const current = [...sectionData];
        current.splice(index, 1);
        return { ...prev, [section]: current };
      }
      return prev;
    });
  }, []);

  const loadTemplate = useCallback((template: StatBlockTemplate) => {
    setStatBlock({ ...template.data } as T);
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
    setStatBlock,
  };
}

// ============================================================================
// Template Selector Component
// ============================================================================

function TemplateSelector({ 
  onSelect, 
  onReset,
  currentSystemId, 
  isLightMode 
}: { 
  onSelect: (template: StatBlockTemplate) => void;
  onReset: () => void;
  currentSystemId: string;
  isLightMode: boolean;
}) {
  const [open, setOpen] = useState(false);

  // Filter templates to only show ones for the current system
  const filteredTemplates = STAT_BLOCK_TEMPLATES.filter(
    template => template.systemId === currentSystemId
  );

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
          <div className="flex items-center justify-between">
            <h3 className={cn(
              "font-medium text-sm",
              isLightMode ? "text-zinc-800" : "text-white"
            )}>Choose a Template</h3>
            <button
              onClick={() => {
                onReset();
                setOpen(false);
              }}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                isLightMode 
                  ? "hover:bg-zinc-100 text-zinc-600 hover:text-zinc-800"
                  : "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              )}
              title="Reset to default"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {filteredTemplates.length > 0 
              ? `${filteredTemplates.length} pre-built creature${filteredTemplates.length !== 1 ? 's' : ''} available`
              : "No templates available for this system"}
          </p>
        </div>
        <div className="p-2">
          {filteredTemplates.map((template) => (
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
  // Always start with default system (for consistent SSR)
  const [systemId, setSystemId] = useState(DEFAULT_SYSTEM_ID);
  
  // Load saved system from localStorage on client side only (after hydration)
  useEffect(() => {
    const saved = loadSystemFromStorage();
    if (saved && saved !== DEFAULT_SYSTEM_ID) {
      // eslint-disable-next-line -- Intentional: loading from localStorage after hydration to avoid SSR mismatch
      setSystemId(saved);
    }
  }, []);
  
  // Get current system and its schema
  const currentSystem = getSystem(systemId);
  const initialData = currentSystem?.schema.defaultData || { name: "New Creature" };
  const systemSections = currentSystem?.schema.sections || [];

  const {
    statBlock,
    saveStatus,
    updateField,
    addTrait,
    updateTrait,
    removeTrait,
    loadTemplate,
    setStatBlock,
  } = useStatBlockEditor(initialData);
  const [isLightMode, setIsLightMode] = useState(false);
  const [isAtPreview, setIsAtPreview] = useState(false);

  // Initialize theme and listen for changes
  useEffect(() => {
    // Set initial theme from document (after hydration)
    // eslint-disable-next-line -- Intentional: reading from document after hydration to avoid SSR mismatch
    setIsLightMode(document.documentElement.classList.contains("light"));

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

  // Save system selection to localStorage
  useEffect(() => {
    saveSystemToStorage(systemId);
  }, [systemId]);

  // Track if user is at or below the preview section
  useEffect(() => {
    const previewElement = document.getElementById("stat-block-preview");
    if (!previewElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Set to true when preview is visible (user scrolled to it)
        setIsAtPreview(entry.isIntersecting);
      },
      {
        threshold: 0.1, // Trigger when at least 10% of preview is visible
        rootMargin: "-20% 0px -20% 0px", // Trigger when preview enters middle of viewport
      }
    );

    observer.observe(previewElement);

    return () => observer.disconnect();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleScrollToggle = () => {
    if (isAtPreview) {
      // Scroll back to top/editor
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Scroll to preview
      const previewElement = document.getElementById("stat-block-preview");
      if (previewElement) {
        previewElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Load template and set the appropriate system
  const handleLoadTemplate = useCallback((template: StatBlockTemplate) => {
    loadTemplate(template);
    setSystemId(template.systemId);
  }, [loadTemplate]);

  // Handle reset to default data for current system
  const handleReset = useCallback(() => {
    const defaultData = currentSystem?.schema.defaultData;
    if (defaultData) {
      setStatBlock(defaultData as AnyStatBlockData);
    }
  }, [currentSystem, setStatBlock]);

  // Handle dynamic field changes (supports nested paths like "abilities.str")
  const handleDynamicFieldChange = useCallback((path: string, value: unknown) => {
    const keys = path.split('.');
    if (keys.length === 1) {
      updateField(keys[0] as keyof AnyStatBlockData, value);
    } else {
      // Handle nested paths
      setStatBlock((prev: AnyStatBlockData) => {
        const newData = { ...prev };
        let current: Record<string, unknown> = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current[keys[i]] = { ...current[keys[i]] as Record<string, unknown> };
          current = current[keys[i]] as Record<string, unknown>;
        }
        current[keys[keys.length - 1]] = value;
        return newData;
      });
    }
  }, [updateField, setStatBlock]);


  // Handle system change with transformation
  const handleSystemChange = (newSystemId: string) => {
    // If switching from 2014 to 2024, transform the data
    if (newSystemId === "dnd5e-2024" && systemId === "dnd5e-2014") {
      const transformed = transformBetweenSystems("dnd5e-2014", "dnd5e-2024", statBlock);
      if (transformed) {
        setStatBlock(transformed as AnyStatBlockData);
      }
    }
    // Note: 2024->2014 transformation not implemented (would lose initiative, gear, etc.)
    // In that case, we just render the existing data in 2014 style
    setSystemId(newSystemId);
  };

  // Get current stat block data with 2024 fields if in 2024 mode
  const currentStatBlock = useMemo((): DnD5e2024Data => {
    if (systemId === "dnd5e-2024") {
      // Ensure 2024-specific fields are calculated if not present
      const data = statBlock as DnD5eData;
      return {
        ...data,
        initiative: data.initiative ?? calculateInitiative(data.abilities.dex).modifier,
        proficiencyBonus: data.proficiencyBonus ?? calculateProficiencyBonus(data.challengeRating),
      } as DnD5e2024Data;
    }
    return statBlock as DnD5e2024Data;
  }, [statBlock, systemId]);

  return (
    <div className={cn(
      "min-h-full transition-colors duration-300 print:bg-white",
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
        <div className="max-w-7xl mx-auto px-6 py-4 gap-2 flex flex-wrap md:flex-nowrap items-center justify-between">
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
              <p className="text-zinc-500 text-sm">Create D&D 5e stat blocks (2014 & 2024 editions)</p>
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
            <SystemSelector
              currentSystemId={systemId}
              onSystemChange={handleSystemChange}
              sourceSystemId="dnd5e-2014"
              isLightMode={isLightMode}
            />
            <TemplateSelector onSelect={handleLoadTemplate} onReset={handleReset} currentSystemId={systemId} isLightMode={isLightMode} />
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
                {/* Dynamic Editor based on System Schema */}
                <DynamicEditor
                  data={statBlock}
                  sections={systemSections}
                  onFieldChange={handleDynamicFieldChange}
                  isLightMode={isLightMode}
                />

                {/* D&D 5e Trait Sections (only for D&D systems) */}
                {(systemId === "dnd5e-2014" || systemId === "dnd5e-2024") && TRAIT_SECTION_KEYS.map((section) => (
                  <TraitEditor
                    key={section}
                    section={section}
                    entries={statBlock[section]}
                    onAdd={() => addTrait(section)}
                    onUpdate={(index, field, value) => updateTrait(section, index, field, value)}
                    onRemove={(index) => removeTrait(section, index)}
                    isLightMode={isLightMode}
                  />
                ))}

                {/* Shadowdark Features */}
                {systemId === "shadowdark" && (
                  <TraitEditor
                    section="features"
                    entries={('features' in statBlock && Array.isArray(statBlock.features)) ? statBlock.features : []}
                    onAdd={() => addTrait("features")}
                    onUpdate={(index, field, value) => updateTrait("features", index, field, value)}
                    onRemove={(index) => removeTrait("features", index)}
                    isLightMode={isLightMode}
                  />
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Preview Panel */}
          <div id="stat-block-preview" className="w-full lg:w-[420px] shrink-0 print:w-full">
            <div className="lg:sticky lg:top-[88px] print:relative print:top-0">
              <div className="flex items-center justify-between mb-3 print:hidden">
                <h2 className="text-sm font-medium text-zinc-500">Preview</h2>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  isLightMode
                    ? "bg-amber-100 text-amber-700"
                    : "bg-amber-900/30 text-amber-400"
                )}>
                  {currentSystem?.schema.metadata.name || systemId}
                </span>
              </div>
              <SystemStatBlockView
                systemId={systemId}
                data={currentStatBlock}
                className="print:shadow-none print:max-w-none"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Floating Scroll Toggle Button (Mobile Only) */}
      <button
        onClick={handleScrollToggle}
        className={cn(
          "fixed bottom-6 right-6 z-50 lg:hidden print:hidden",
          "w-14 h-14 rounded-full shadow-lg",
          "flex items-center justify-center",
          "transition-all duration-200 hover:scale-110 active:scale-95",
          isLightMode
            ? "bg-amber-600 hover:bg-amber-500 text-white"
            : "bg-amber-600 hover:bg-amber-500 text-white"
        )}
        aria-label={isAtPreview ? "Scroll to details" : "Scroll to preview"}
      >
        {isAtPreview ? (
          <ChevronUp className="w-6 h-6" />
        ) : (
          <ChevronDown className="w-6 h-6" />
        )}
      </button>

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
