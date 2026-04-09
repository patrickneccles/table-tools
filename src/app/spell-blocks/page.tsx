'use client';

import { ErrorBoundary } from '@/components/error-boundary';
import { DynamicEditor } from '@/components/stat-block';
import {
  DEFAULT_SPELL_SYSTEM_ID,
  getAllSpellSystemMetadata,
  getSpellSystem,
  loadSpellFromStorage,
  loadSpellSystemFromStorage,
  saveSpellSystemToStorage,
  subscribeSpellSystemId,
  saveSpellToStorage,
  SpellTemplateSelector,
  SystemSpellView,
} from '@/components/spell-block';
import type { DnD5e2024SpellData } from '@/components/spell-block';
import type { StatBlockTemplate } from '@/components/stat-block/stat-block-utils';
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
  Check,
  Download,
  Home,
  MoreHorizontal,
  Redo2,
  Sparkles,
  Undo2,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

type AnySpellData = DnD5e2024SpellData & Record<string, unknown>;

type SpellFileData = {
  systemId: string;
  spell: AnySpellData;
};

// ─── Save status indicator ───────────────────────────────────────────────────

function SaveStatusIndicator({ status }: { status: 'idle' | 'saving' | 'saved' }) {
  if (status === 'idle') return null;
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {status === 'saving' && (
        <>
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-zinc-500">Saving…</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="h-3 w-3 text-emerald-500" />
          <span className="text-zinc-500">Saved</span>
        </>
      )}
    </div>
  );
}

// ─── Editor hook ─────────────────────────────────────────────────────────────

function useSpellEditor(initialData: AnySpellData) {
  const history = useHistory<AnySpellData>(initialData, 50);
  const spell = history.state;
  const setSpell = history.setState;

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadSpellFromStorage();
    if (saved) history.reset(saved as AnySpellData);
    isInitialMount.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    if (isInitialMount.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (savedStatusTimerRef.current) clearTimeout(savedStatusTimerRef.current);
    setSaveStatus('saving');
    saveTimeoutRef.current = setTimeout(() => {
      saveSpellToStorage(spell);
      setSaveStatus('saved');
      savedStatusTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (savedStatusTimerRef.current) clearTimeout(savedStatusTimerRef.current);
    };
  }, [spell]);

  const handleFieldChange = useCallback(
    (path: string, value: unknown) => {
      const keys = path.split('.');
      if (keys.length === 1) {
        setSpell((prev) => ({ ...prev, [keys[0]]: value }));
      } else {
        setSpell((prev) => {
          const next = { ...prev };
          let cursor: Record<string, unknown> = next;
          for (let i = 0; i < keys.length - 1; i++) {
            cursor[keys[i]] = { ...(cursor[keys[i]] as Record<string, unknown>) };
            cursor = cursor[keys[i]] as Record<string, unknown>;
          }
          cursor[keys[keys.length - 1]] = value;
          return next;
        });
      }
    },
    [setSpell]
  );

  return {
    spell,
    setSpell,
    saveStatus,
    handleFieldChange,
    undo: history.undo,
    redo: history.redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    captureSnapshot: history.captureSnapshot,
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SpellBlocksPage() {
  const isLightMode = useIsLightMode();

  const systemId = useSyncExternalStore(
    subscribeSpellSystemId,
    () => loadSpellSystemFromStorage() ?? DEFAULT_SPELL_SYSTEM_ID,
    () => DEFAULT_SPELL_SYSTEM_ID
  );

  const setSystemId = useCallback((id: string) => {
    saveSpellSystemToStorage(id);
  }, []);

  const currentSystem = getSpellSystem(systemId);
  const initialData = (currentSystem?.schema.defaultData ?? { name: 'New Spell' }) as AnySpellData;
  const systemSections = currentSystem?.schema.sections ?? [];
  const allSystems = getAllSpellSystemMetadata();

  const {
    spell,
    setSpell,
    saveStatus,
    handleFieldChange,
    undo,
    redo,
    canUndo,
    canRedo,
    captureSnapshot,
  } = useSpellEditor(initialData);

  const [currentFile, setCurrentFile] = useState<TableToolsFile<SpellFileData> | null>(null);

  const handleExport = useCallback(() => {
    const payload: SpellFileData = { systemId, spell };
    const file = currentFile
      ? updateFile(currentFile, payload)
      : createFile('spell-block', spell.name || 'Untitled Spell', payload);
    setCurrentFile(file);
    downloadFile(file);
  }, [currentFile, systemId, spell]);

  const handleImport = useCallback(async () => {
    try {
      const file = await uploadFile<SpellFileData>('spell-block');
      setCurrentFile(file);
      if (file.data.systemId) setSystemId(file.data.systemId);
      setSpell(file.data.spell as AnySpellData);
    } catch (err) {
      if (err instanceof Error && err.message !== 'File selection cancelled.') {
        console.error('Failed to import spell:', err);
        alert(err.message);
      }
    }
  }, [setSpell, setSystemId]);

  const handleLoadTemplate = useCallback(
    (template: StatBlockTemplate) => {
      setSpell({ ...template.data } as AnySpellData);
      setSystemId(template.systemId);
      setCurrentFile(null);
    },
    [setSpell, setSystemId]
  );

  const handleReset = useCallback(() => {
    const defaultData = currentSystem?.schema.defaultData;
    if (defaultData) {
      setSpell(defaultData as AnySpellData);
      setCurrentFile(null);
    }
  }, [currentSystem, setSpell]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;
      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
        case 'y':
          e.preventDefault();
          redo();
          break;
        case 'e':
          e.preventDefault();
          handleExport();
          break;
        case 'i':
          e.preventDefault();
          void handleImport();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleExport, handleImport]);

  return (
    <div
      className={cn(
        'min-h-full transition-colors duration-300',
        isLightMode
          ? 'bg-gradient-to-b from-zinc-50 to-zinc-100'
          : 'bg-gradient-to-b from-zinc-900 to-zinc-950'
      )}
    >
      {/* Header */}
      <header
        className={cn(
          'sticky top-0 z-50 border-b backdrop-blur-sm transition-colors print:hidden',
          isLightMode ? 'border-zinc-200 bg-white/80' : 'border-zinc-800 bg-zinc-900/80'
        )}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-6 py-4 lg:flex-nowrap">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'rounded-lg p-2',
                isLightMode ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/20 text-blue-400'
              )}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1
                className={cn(
                  'text-xl font-bold transition-colors',
                  isLightMode ? 'text-zinc-800' : 'text-white'
                )}
              >
                Spell Block Generator
              </h1>
              <p className="text-sm text-zinc-500">
                Create spell blocks for D&amp;D 5e and other TTRPG systems
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Home */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                'rounded-full text-xs',
                isLightMode
                  ? 'border border-zinc-900/10 bg-zinc-900/10 text-zinc-600 hover:bg-zinc-900/20 hover:text-zinc-800'
                  : 'border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
              )}
            >
              <Link href="/">
                <Home className="h-3 w-3" />
                <span className="ml-1 hidden md:inline">Home</span>
              </Link>
            </Button>

            <SaveStatusIndicator status={saveStatus} />

            {/* System selector */}
            {allSystems.length > 1 && (
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
                  >
                    {currentSystem?.schema.metadata.name ?? systemId}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {allSystems.map((meta) => (
                    <DropdownMenuItem key={meta.id} onClick={() => setSystemId(meta.id)}>
                      {meta.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Templates */}
            <SpellTemplateSelector
              onSelect={handleLoadTemplate}
              onReset={handleReset}
              currentSystemId={systemId}
              currentSystemName={currentSystem?.schema.metadata.name}
              isLightMode={isLightMode}
            />

            {/* Actions */}
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
                >
                  <MoreHorizontal className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={undo} disabled={!canUndo}>
                  <Undo2 className="mr-2 h-4 w-4" />
                  Undo
                  <span className="ml-auto text-xs text-muted-foreground">⌘Z</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={redo} disabled={!canRedo}>
                  <Redo2 className="mr-2 h-4 w-4" />
                  Redo
                  <span className="ml-auto text-xs text-muted-foreground">⌘⇧Z</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export JSON
                  <span className="ml-auto text-xs text-muted-foreground">⌘E</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void handleImport()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import JSON
                  <span className="ml-auto text-xs text-muted-foreground">⌘I</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Editor panel */}
          <ErrorBoundary>
            <div className="flex-1 pr-4">
              <DynamicEditor
                data={spell}
                sections={systemSections}
                onFieldChange={handleFieldChange}
                onBlur={() => setTimeout(() => captureSnapshot(), 0)}
                isLightMode={isLightMode}
              />
            </div>
          </ErrorBoundary>

          {/* Preview panel */}
          <ErrorBoundary>
            <div className="w-full lg:w-[380px] lg:shrink-0">
              <div className="lg:sticky lg:top-[88px]">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-medium text-zinc-500">Preview</h2>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs',
                      isLightMode ? 'bg-blue-100 text-blue-700' : 'bg-blue-900/30 text-blue-400'
                    )}
                  >
                    {currentSystem?.schema.metadata.name ?? systemId}
                  </span>
                </div>
                <SystemSpellView systemId={systemId} data={spell as Record<string, unknown>} />
              </div>
            </div>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
