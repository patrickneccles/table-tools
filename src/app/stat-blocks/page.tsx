"use client";

import { ErrorBoundary } from "@/components/error-boundary";
import type { AbilityKey, BaseStatBlockData, DnD5e2014Data, DnD5e2024Data, StatBlockTemplate, TraitSectionKey } from "@/components/stat-block";
import {
  DEFAULT_SYSTEM_ID,
  DynamicEditor,
  getSystem,
  loadStatBlockFromStorage,
  loadSystemFromStorage,
  saveStatBlockToStorage,
  saveSystemToStorage,
  SystemSelector,
  SystemStatBlockView,
  TraitEditor,
  transformBetweenSystems,
} from "@/components/stat-block";
import { calculateInitiative, calculateProficiencyBonus } from "@/components/stat-block/systems/dnd5e-2024";
import { TemplateSelector } from "@/components/stat-block/template-selector";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHistory } from "@/hooks/use-history";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronUp, Download, Home, MoreHorizontal, Printer, Redo2, Scroll, Undo2, Upload } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  // Use history management for undo/redo
  const history = useHistory<T>(initialData, 50);
  const statBlock = history.state;
  const setStatBlock = history.setState;
  
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Load from localStorage on client side only (after hydration)
  useEffect(() => {
    const saved = loadStatBlockFromStorage();
    if (saved) {
      setStatBlock(saved as unknown as T);
    }
    isInitialMount.current = false;
  }, [setStatBlock]);

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
  }, [setStatBlock]);

  const updateAbility = useCallback((ability: AbilityKey, value: number) => {
    setStatBlock((prev) => {
      // Type guard for D&D 5e data with abilityScores field
      if ('abilityScores' in prev && typeof prev.abilityScores === 'object') {
        return {
          ...prev,
          abilityScores: { ...prev.abilityScores as Record<string, unknown>, [ability]: value },
        };
      }
      return prev;
    });
  }, [setStatBlock]);

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
  }, [setStatBlock]);

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
  }, [setStatBlock]);

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
  }, [setStatBlock]);

  const loadTemplate = useCallback((template: StatBlockTemplate) => {
    setStatBlock({ ...template.data } as T);
  }, [setStatBlock]);

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
    // History management
    undo: history.undo,
    redo: history.redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    captureSnapshot: history.captureSnapshot,
  };
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
    undo,
    redo,
    canUndo,
    canRedo,
    captureSnapshot,
  } = useStatBlockEditor(initialData);
  const [isLightMode, setIsLightMode] = useState(false);
  const [isAtPreview, setIsAtPreview] = useState(false);

  // Client-side initialization: theme, preview scroll tracking (runs once on mount)
  useEffect(() => {
    // Set initial theme from document (after hydration)
    // eslint-disable-next-line -- Intentional: reading from document after hydration to avoid SSR mismatch
    setIsLightMode(document.documentElement.classList.contains("light"));

    // Listen for theme changes from global toggle
    const themeObserver = new MutationObserver(() => {
      setIsLightMode(document.documentElement.classList.contains("light"));
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Track if user is at or below the preview section
    const previewElement = document.getElementById("stat-block-preview");
    let previewObserver: IntersectionObserver | null = null;

    if (previewElement) {
      previewObserver = new IntersectionObserver(
        ([entry]) => {
          // Set to true when preview is visible (user scrolled to it)
          setIsAtPreview(entry.isIntersecting);
        },
        {
          threshold: 0.1, // Trigger when at least 10% of preview is visible
          rootMargin: "-20% 0px -20% 0px", // Trigger when preview enters middle of viewport
        }
      );
      previewObserver.observe(previewElement);
    }

    return () => {
      themeObserver.disconnect();
      previewObserver?.disconnect();
    };
  }, []);

  // Save system selection to localStorage (runs when systemId changes)
  useEffect(() => {
    saveSystemToStorage(systemId);
  }, [systemId]);

  // Handlers for keyboard shortcuts and UI actions
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleExport = useCallback(() => {
    const exportData = {
      version: "1.0",
      systemId,
      data: statBlock,
      exportedAt: new Date().toISOString(),
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${statBlock.name || "stat-block"}-${systemId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [systemId, statBlock]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        
        // Validate basic structure
        if (!imported.data || !imported.systemId) {
          alert("Invalid stat block file format");
          return;
        }

        // Set system and data
        setSystemId(imported.systemId);
        setStatBlock(imported.data as AnyStatBlockData);
      } catch (error) {
        console.error("Failed to import stat block:", error);
        alert("Failed to import stat block. Please check the file format.");
      }
    };
    input.click();
  }, [setStatBlock]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Prevent default for our shortcuts
      if (modifier) {
        switch (e.key.toLowerCase()) {
          case 'z':
            if (e.shiftKey) {
              // Redo: Ctrl/Cmd+Shift+Z
              e.preventDefault();
              redo();
            } else {
              // Undo: Ctrl/Cmd+Z
              e.preventDefault();
              undo();
            }
            break;
          case 'y':
            // Redo: Ctrl/Cmd+Y
            e.preventDefault();
            redo();
            break;
          case 'p':
            // Print: Ctrl/Cmd+P (browser default, but we capture for consistency)
            e.preventDefault();
            handlePrint();
            break;
          case 'e':
            // Export: Ctrl/Cmd+E
            e.preventDefault();
            handleExport();
            break;
          case 'i':
            // Import: Ctrl/Cmd+I
            e.preventDefault();
            handleImport();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handlePrint, handleExport, handleImport]);

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

  // Handle dynamic field changes (supports nested paths like "abilityScores.str")
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
        initiative: data.initiative ?? calculateInitiative(data.abilityScores.dex).modifier,
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
        <div className="max-w-7xl mx-auto px-6 py-4 gap-2 flex flex-wrap lg:flex-nowrap items-center justify-between">
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
              <p className="text-zinc-500 text-sm">Create stat blocks (D&D 5e and other TTRPG systems)</p>
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
                <span className="hidden md:inline ml-1">Home</span>
              </Link>
            </Button>
            <SaveStatusIndicator status={saveStatus} />
            <SystemSelector
              currentSystemId={systemId}
              onSystemChange={handleSystemChange}
              isLightMode={isLightMode}
            />
            <TemplateSelector
              onSelect={handleLoadTemplate}
              onReset={handleReset}
              currentSystemId={systemId}
              currentSystemName={getSystem(systemId)?.schema.metadata.name}
              isLightMode={isLightMode}
            />
            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    isLightMode
                      ? "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800"
                  )}
                  title="More actions"
                >
                  <MoreHorizontal className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={undo} disabled={!canUndo}>
                  <Undo2 className="h-4 w-4 mr-2" />
                  Undo
                  <span className="ml-auto text-xs text-muted-foreground">⌘Z</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={redo} disabled={!canRedo}>
                  <Redo2 className="h-4 w-4 mr-2" />
                  Redo
                  <span className="ml-auto text-xs text-muted-foreground">⌘⇧Z</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                  <span className="ml-auto text-xs text-muted-foreground">⌘E</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImport}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import JSON
                  <span className="ml-auto text-xs text-muted-foreground">⌘I</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handlePrint} size="sm" className="bg-amber-600 hover:bg-amber-500 text-white">
              <Printer className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Print</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6 print:p-0 print:max-w-none">
        <div className="flex flex-col lg:flex-row gap-8 print:block">
          {/* Editor Panel */}
          <ErrorBoundary>
            <div className="flex-1 print:hidden">
              <ScrollArea className="h-[calc(100vh-140px)] pr-4">
                <div className="space-y-4">
                  {/* Dynamic Editor based on System Schema */}
                  <DynamicEditor
                    data={statBlock}
                    sections={systemSections}
                    onFieldChange={handleDynamicFieldChange}
                    onBlur={captureSnapshot}
                    isLightMode={isLightMode}
                  />

                  {/* Trait/Feature Sections (dynamically loaded from system schema) */}
                  {currentSystem?.schema.traitSections?.map((section) => (
                    <TraitEditor
                      key={section}
                      section={section as TraitSectionKey}
                      entries={(section in statBlock && Array.isArray(statBlock[section])) ? statBlock[section] : []}
                      onAdd={() => addTrait(section as TraitSectionKey)}
                      onUpdate={(index, field, value) => updateTrait(section as TraitSectionKey, index, field, value)}
                      onRemove={(index) => removeTrait(section as TraitSectionKey, index)}
                      isLightMode={isLightMode}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </ErrorBoundary>

          {/* Preview Panel */}
          <ErrorBoundary>
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
          </ErrorBoundary>
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

      {/* Global styles */}
      <style jsx global>{`
        /* Browser autofill styling for light and dark themes */
        html.light input:-webkit-autofill,
        html.light input:-webkit-autofill:hover,
        html.light input:-webkit-autofill:focus,
        html.light textarea:-webkit-autofill,
        html.light textarea:-webkit-autofill:hover,
        html.light textarea:-webkit-autofill:focus {
          -webkit-text-fill-color: rgb(39 39 42) !important;
          -webkit-box-shadow: 0 0 0 1000px rgb(255 255 255) inset !important;
          box-shadow: 0 0 0 1000px rgb(255 255 255) inset !important;
          background-color: rgb(255 255 255) !important;
          border-color: rgb(212 212 216) !important;
        }

        /* Dark mode is default, so we target both explicit .dark and no class */
        html:not(.light) input:-webkit-autofill,
        html:not(.light) input:-webkit-autofill:hover,
        html:not(.light) input:-webkit-autofill:focus,
        html:not(.light) textarea:-webkit-autofill,
        html:not(.light) textarea:-webkit-autofill:hover,
        html:not(.light) textarea:-webkit-autofill:focus {
          -webkit-text-fill-color: rgb(255 255 255) !important;
          -webkit-box-shadow: 0 0 0 1000px rgba(39 39 42 / 0.5) inset !important;
          box-shadow: 0 0 0 1000px rgba(39 39 42 / 0.5) inset !important;
          background-color: rgba(39 39 42 / 0.5) !important;
          border-color: rgb(63 63 70) !important;
        }

        @media print {
          @page {
            size: portrait;
            margin: 0.5in;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          html {
            background: white !important;
          }
          
          body {
            background: white !important;
          }
          
          /* Force all container backgrounds to white/transparent */
          body > div,
          body > div > div,
          #__next,
          #__next > div,
          main,
          main > div {
            background: white !important;
            background-color: white !important;
            background-image: none !important;
          }
        }
      `}</style>
    </div>
  );
}
