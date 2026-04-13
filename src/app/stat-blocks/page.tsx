'use client';

import { DynamicEditor } from '@/components/editor';
import { ErrorBoundary } from '@/components/error-boundary';
import { SaveStatusIndicator } from '@/components/save-status-indicator';
import { toast } from 'sonner';
import type {
  AbilityKey,
  BaseStatBlockData,
  DnD5e2014Data,
  DnD5e2024Data,
  StatBlockTemplate,
} from '@/components/stat-block';
import {
  DEFAULT_SYSTEM_ID,
  getSystem,
  loadStatBlockFromStorage,
  saveStatBlockToStorage,
  SystemSelector,
  SystemStatBlockView,
} from '@/components/stat-block';
import { resolveSystem, saveActiveSystem, useActiveSystem } from '@/lib/active-system';
import {
  calculateInitiative,
  calculateProficiencyBonus,
} from '@/components/stat-block/systems/dnd5e-2024';
import { TemplateSelector } from '@/components/stat-block/template-selector';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useHistory } from '@/hooks/use-history';
import { useIsLightMode } from '@/hooks/use-is-light-mode';
import {
  createFile,
  downloadFile,
  type TableToolsFile,
  updateFile,
  uploadFile,
} from '@/lib/file-system';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronUp,
  Download,
  MoreHorizontal,
  Printer,
  Redo2,
  PanelTopDashed,
  Undo2,
  Upload,
} from 'lucide-react';
import { KeyboardShortcutsHelp } from '@/components/ui/keyboard-shortcuts-help';
import { ToolPageHeader } from '@/components/layout/tool-page-header';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Generic stat block data that can be any system's data
type AnyStatBlockData = BaseStatBlockData & Record<string, unknown>;

// Payload stored inside a TableToolsFile for stat blocks
type StatBlockFileData = {
  systemId: string;
  statBlock: AnyStatBlockData;
};

// Combined D&D 5e type that includes both 2014 and 2024 fields
type DnD5eData = (DnD5e2014Data | DnD5e2024Data) &
  Partial<{
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

function useStatBlockEditor<T extends AnyStatBlockData>(initialData: T, onLoad?: () => void) {
  // Use history management for undo/redo
  const history = useHistory<T>(initialData, 50);
  const statBlock = history.state;
  const setStatBlock = history.setState;

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);
  // Stable ref so the effect below doesn't re-run when onLoad identity changes
  const onLoadRef = useRef(onLoad);
  useEffect(() => {
    onLoadRef.current = onLoad;
  });

  // Load from localStorage on client side only (after hydration)
  useEffect(() => {
    const saved = loadStatBlockFromStorage();
    if (saved) {
      history.reset(saved as unknown as T);
      onLoadRef.current?.();
    }
    isInitialMount.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save to localStorage with debounce
  useEffect(() => {
    if (isInitialMount.current) return;

    // Intentional: update save status when statBlock changes for auto-save feedback
    setSaveStatus('saving');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveStatBlockToStorage(statBlock);
      setSaveStatus('saved');

      // Reset status after a delay
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [statBlock]);

  const updateField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setStatBlock((prev) => ({ ...prev, [field]: value }));
    },
    [setStatBlock]
  );

  const updateAbility = useCallback(
    (ability: AbilityKey, value: number) => {
      setStatBlock((prev) => {
        // Type guard for D&D 5e data with abilityScores field
        if ('abilityScores' in prev && typeof prev.abilityScores === 'object') {
          return {
            ...prev,
            abilityScores: { ...(prev.abilityScores as Record<string, unknown>), [ability]: value },
          };
        }
        return prev;
      });
    },
    [setStatBlock]
  );

  const loadTemplate = useCallback(
    (template: StatBlockTemplate) => {
      setStatBlock({ ...template.data } as T);
    },
    [setStatBlock]
  );

  return {
    statBlock,
    saveStatus,
    updateField,
    updateAbility,
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
// ============================================================================
// Page Component
// ============================================================================

export default function StatBlocksPage() {
  const activeSystem = useActiveSystem();
  const systemId = resolveSystem(
    activeSystem,
    ['dnd5e-2014', 'dnd5e-2024', 'shadowdark'],
    DEFAULT_SYSTEM_ID
  );

  // Get current system and its schema
  const currentSystem = getSystem(systemId);
  const initialData = (currentSystem?.schema.defaultData ?? {
    name: 'New Creature',
  }) as AnyStatBlockData;
  const systemSections = currentSystem?.schema.sections || [];

  const [loadKey, setLoadKey] = useState(0);
  const bumpLoadKey = useCallback(() => setLoadKey((k) => k + 1), []);

  const {
    statBlock,
    saveStatus,
    updateField,
    loadTemplate,
    setStatBlock,
    undo,
    redo,
    canUndo,
    canRedo,
    captureSnapshot,
  } = useStatBlockEditor(initialData, bumpLoadKey);
  const isLightMode = useIsLightMode();
  const [isAtPreview, setIsAtPreview] = useState(false);
  // Tracks the identity of the current file — set on import, preserved on export so repeated
  // saves update the same file (same id / createdAt) rather than minting a new one each time.
  const [currentFile, setCurrentFile] = useState<TableToolsFile<StatBlockFileData> | null>(null);

  // Track if user is at or below the preview section
  useEffect(() => {
    const previewElement = document.getElementById('stat-block-preview');
    let previewObserver: IntersectionObserver | null = null;

    if (previewElement) {
      previewObserver = new IntersectionObserver(
        ([entry]) => {
          setIsAtPreview(entry.isIntersecting);
        },
        {
          threshold: 0.1,
          rootMargin: '-20% 0px -20% 0px',
        }
      );
      previewObserver.observe(previewElement);
    }

    return () => {
      previewObserver?.disconnect();
    };
  }, []);

  // Handlers for keyboard shortcuts and UI actions
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleExport = useCallback(() => {
    const payload: StatBlockFileData = { systemId, statBlock };
    const file = currentFile
      ? updateFile(currentFile, payload)
      : createFile('stat-block', statBlock.name || 'Untitled', payload);
    setCurrentFile(file);
    downloadFile(file);
  }, [currentFile, systemId, statBlock]);

  const handleImport = useCallback(async () => {
    try {
      const file = await uploadFile<StatBlockFileData>('stat-block');
      setCurrentFile(file);
      saveActiveSystem(file.data.systemId);
      setStatBlock(file.data.statBlock as AnyStatBlockData);
      bumpLoadKey();
    } catch (err) {
      if (err instanceof Error && err.message !== 'File selection cancelled.') {
        console.error('Failed to import stat block:', err);
        toast.error(err.message);
      }
    }
  }, [setStatBlock, bumpLoadKey]);

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
            void handleImport();
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Scroll to preview
      const previewElement = document.getElementById('stat-block-preview');
      if (previewElement) {
        previewElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Load template and set the appropriate system
  const handleLoadTemplate = useCallback(
    (template: StatBlockTemplate) => {
      loadTemplate(template);
      saveActiveSystem(template.systemId);
      setCurrentFile(null);
      bumpLoadKey();
    },
    [loadTemplate, bumpLoadKey]
  );

  // Handle reset to default data for current system
  const handleReset = useCallback(() => {
    const defaultData = currentSystem?.schema.defaultData;
    if (defaultData) {
      setStatBlock(defaultData as AnyStatBlockData);
      setCurrentFile(null);
      bumpLoadKey();
    }
  }, [currentSystem, setStatBlock, bumpLoadKey]);

  // Handle dynamic field changes (supports nested paths like "abilityScores.str")
  const handleDynamicFieldChange = useCallback(
    (path: string, value: unknown) => {
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
            current[keys[i]] = { ...(current[keys[i]] as Record<string, unknown>) };
            current = current[keys[i]] as Record<string, unknown>;
          }
          current[keys[keys.length - 1]] = value;
          return newData;
        });
      }
    },
    [updateField, setStatBlock]
  );

  // Handle system change — data is kept as-is, renderer adapts
  const handleSystemChange = (newSystemId: string) => {
    saveActiveSystem(newSystemId);
  };

  // Get current stat block data with 2024 fields if in 2024 mode
  const currentStatBlock = useMemo((): DnD5e2024Data => {
    if (systemId === 'dnd5e-2024') {
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
    <div
      className={cn(
        'flex-1 transition-colors duration-300 print:bg-white',
        isLightMode
          ? 'bg-gradient-to-b from-zinc-50 to-zinc-100'
          : 'bg-gradient-to-b from-zinc-900 to-zinc-950'
      )}
    >
      <ToolPageHeader
        heading="Stat Block Generator"
        subtitle="Create stat blocks (D&D 5e and other TTRPG systems)"
        icon={<PanelTopDashed className="h-5 w-5" />}
        iconColor="#f59e0b"
      >
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                isLightMode
                  ? 'border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100'
                  : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800'
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
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
              <span className="ml-auto text-xs text-muted-foreground">⌘P</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <KeyboardShortcutsHelp
          groups={[
            {
              label: 'History',
              shortcuts: [
                { keys: '⌘Z', description: 'Undo' },
                { keys: '⇧⌘Z', description: 'Redo' },
              ],
            },
            {
              label: 'File',
              shortcuts: [
                { keys: '⌘E', description: 'Export JSON' },
                { keys: '⌘I', description: 'Import JSON' },
                { keys: '⌘P', description: 'Print' },
              ],
            },
          ]}
        />
        <Button
          onClick={handlePrint}
          size="sm"
          className="bg-amber-600 hover:bg-amber-500 text-white"
        >
          <Printer className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Print</span>
        </Button>
      </ToolPageHeader>

      <main className="max-w-7xl mx-auto py-8 px-6 print:p-0 print:max-w-none">
        <div className="flex flex-col lg:flex-row gap-8 print:block">
          {/* Editor Panel */}
          <ErrorBoundary>
            <div className="flex-1 pr-4 print:hidden">
              <div className="space-y-4">
                {/* Dynamic Editor based on System Schema */}
                <DynamicEditor
                  data={statBlock}
                  sections={systemSections}
                  onFieldChange={handleDynamicFieldChange}
                  onBlur={() => setTimeout(() => captureSnapshot(), 0)}
                  isLightMode={isLightMode}
                  loadKey={loadKey}
                />
              </div>
            </div>
          </ErrorBoundary>

          {/* Preview Panel */}
          <ErrorBoundary>
            <div id="stat-block-preview" className="max-w-lg shrink-0 mx-auto print:w-full">
              <div className="lg:sticky lg:top-[88px] print:relative print:top-0">
                <div className="flex items-center justify-between mb-3 print:hidden">
                  <h2 className="text-sm font-medium text-zinc-500">Preview</h2>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      isLightMode ? 'bg-amber-100 text-amber-700' : 'bg-amber-900/30 text-amber-400'
                    )}
                  >
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
      <Button
        onClick={handleScrollToggle}
        size="icon"
        aria-label={isAtPreview ? 'Scroll to details' : 'Scroll to preview'}
        className="fixed bottom-6 right-6 z-50 lg:hidden print:hidden h-14 w-14 rounded-full shadow-lg bg-amber-600 hover:bg-amber-500 text-white hover:scale-110 active:scale-95 transition-all duration-200"
      >
        {isAtPreview ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
      </Button>

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
      <SaveStatusIndicator status={saveStatus} />
    </div>
  );
}
