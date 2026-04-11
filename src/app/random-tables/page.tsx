'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KeyboardShortcutsHelp } from '@/components/ui/keyboard-shortcuts-help';
import { SaveStatusIndicator } from '@/components/save-status-indicator';
import { ToolPageHeader } from '@/components/layout/tool-page-header';
import { TableEditor } from '@/components/random-tables/table-editor';
import { TEMPLATES, loadTemplate } from '@/components/random-tables/templates';
import {
  DEFAULT_TABLE,
  formatRange,
  parseDieExpr,
  rollTable,
  totalWeight,
  validateTable,
  type RandomTableData,
  type RollResult,
} from '@/components/random-tables/random-table-utils';
import {
  createFile,
  downloadFile,
  type TableToolsFile,
  updateFile,
  uploadFile,
} from '@/lib/file-system';
import { useIsLightMode } from '@/hooks/use-is-light-mode';
import { cn } from '@/lib/utils';
import { Download, MoreHorizontal, Shuffle, Table2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'random-table-current';

function loadFromStorage(): RandomTableData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RandomTableData;
  } catch {
    return null;
  }
}

function saveToStorage(data: RandomTableData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export default function RandomTablesPage() {
  const isLightMode = useIsLightMode();

  const [tableData, setTableData] = useState<RandomTableData>(DEFAULT_TABLE);
  // Separate input state so typing an invalid expression mid-edit doesn't break things
  const [dieInput, setDieInput] = useState(DEFAULT_TABLE.dieExpr);
  const [lastRoll, setLastRoll] = useState<RollResult | null>(null);
  const [currentFile, setCurrentFile] = useState<TableToolsFile<RandomTableData> | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Load from localStorage on mount
  useEffect(() => {
    const handleLoadFromStorage = () => {
      const saved = loadFromStorage();
      if (saved) {
        const merged = { ...DEFAULT_TABLE, ...saved };
        setTableData(merged);
        setDieInput(merged.dieExpr);
      }
      isInitialMount.current = false;
    };
    handleLoadFromStorage();
     
  }, []);

  // Auto-save to localStorage (debounced)
  useEffect(() => {
    const handleTableDataChange = () => {
      if (isInitialMount.current) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      setSaveStatus('saving');
      saveTimerRef.current = setTimeout(() => {
        saveToStorage(tableData);
        setSaveStatus('saved');
        savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
      }, 500);
    };
    handleTableDataChange();
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, [tableData]);

  // Derived die info from the last valid expression stored in tableData
  const dieInfo = parseDieExpr(tableData.dieExpr);
  const dieInputInfo = parseDieExpr(dieInput);
  const dieInputError = dieInput.trim() !== '' && dieInputInfo === null;

  const validation = validateTable(tableData.dieExpr, tableData.entries);
  const used = totalWeight(tableData.entries);
  const capacity = dieInfo?.total ?? 0;

  const handleDieInputChange = (value: string) => {
    setDieInput(value);
    const info = parseDieExpr(value);
    if (info) {
      setTableData((prev) => ({ ...prev, dieExpr: info.expr }));
      setLastRoll(null);
    }
  };

  const handleRoll = useCallback(() => {
    const result = rollTable(tableData.dieExpr, tableData.entries);
    setLastRoll(result);
    if (result) {
      const id = crypto.randomUUID();
      toast(
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold tabular-nums text-orange-500">{result.roll}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-zinc-500 mb-0.5">
              {formatRange(result.range)} on {tableData.dieExpr}
            </p>
            <p className="text-sm font-medium leading-snug">{result.entry.result || '—'}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toast.dismiss(id)}
            aria-label="Dismiss"
            className="shrink-0 h-6 w-6 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>,
        { id, duration: Infinity }
      );
    }
  }, [tableData]);

  const handleExport = useCallback(() => {
    const file = currentFile
      ? updateFile(currentFile, tableData)
      : createFile('random-table', tableData.name || 'Untitled Table', tableData);
    setCurrentFile(file);
    downloadFile(file);
  }, [currentFile, tableData]);

  const handleImport = useCallback(async () => {
    try {
      const file = await uploadFile<RandomTableData>('random-table');
      setCurrentFile(file);
      setTableData(file.data);
      setDieInput(file.data.dieExpr);
      setLastRoll(null);
    } catch (err) {
      if (err instanceof Error && err.message !== 'File selection cancelled.') {
        toast.error(err.message);
      }
    }
  }, []);

  const handleLoadTemplate = useCallback((templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const data = loadTemplate(template);
    setTableData(data);
    setDieInput(data.dieExpr);
    setCurrentFile(null);
    setLastRoll(null);
  }, []);

  const handleNew = useCallback(() => {
    setTableData(DEFAULT_TABLE);
    setDieInput(DEFAULT_TABLE.dieExpr);
    setCurrentFile(null);
    setLastRoll(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = navigator.platform.toUpperCase().includes('MAC') ? e.metaKey : e.ctrlKey;
      if (!mod) return;
      switch (e.key.toLowerCase()) {
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
  }, [handleExport, handleImport]);

  const dimText = isLightMode ? 'text-zinc-400' : 'text-zinc-500';
  const cardClass = cn(
    'transition-colors',
    isLightMode ? 'bg-white border-zinc-200' : 'bg-zinc-900/50 border-zinc-800'
  );

  const validationLabel =
    validation === 'ok'
      ? `${used} / ${capacity} ✓`
      : validation === 'invalid-expr'
        ? null
        : `${used} / ${capacity}`;

  const validationColor =
    validation === 'ok'
      ? isLightMode
        ? 'text-emerald-600'
        : 'text-emerald-400'
      : validation === 'over'
        ? isLightMode
          ? 'text-red-600'
          : 'text-red-400'
        : dimText;

  return (
    <div
      className={cn(
        'flex-1 transition-colors duration-300',
        isLightMode ? 'bg-[#f5f5f7]' : 'bg-[#0a0a0b]'
      )}
    >
      <ToolPageHeader
        heading="Random Tables"
        subtitle="Build weighted tables and roll for random results"
        icon={<Table2 className="h-5 w-5" />}
        iconColor="#f97316"
      >
        <Button
          onClick={handleRoll}
          disabled={validation !== 'ok'}
          size="sm"
          className="bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-40"
        >
          <Shuffle className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Roll</span>
        </Button>

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
          <DropdownMenuContent align="end" className="w-52">
            {TEMPLATES.map((t) => (
              <DropdownMenuItem key={t.id} onClick={() => handleLoadTemplate(t.id)}>
                {t.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleNew}>New table</DropdownMenuItem>
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

        <KeyboardShortcutsHelp
          groups={[
            {
              label: 'File',
              shortcuts: [
                { keys: '⌘E', description: 'Export JSON' },
                { keys: '⌘I', description: 'Import JSON' },
              ],
            },
          ]}
        />
      </ToolPageHeader>

      <div className="container mx-auto max-w-3xl px-4 py-8 space-y-4">
        {/* Table config + entries */}
        <Card className={cardClass}>
          <CardHeader className="pb-3 space-y-2">
            {/* Name + die + weight indicator */}
            <div className="flex items-center gap-3">
              <Input
                value={tableData.name}
                onChange={(e) => setTableData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Table name…"
                className={cn(
                  'h-8 flex-1 border-0 bg-transparent px-0 text-base font-semibold shadow-none focus-visible:ring-0',
                  isLightMode ? 'text-zinc-800' : 'text-white'
                )}
              />

              {/* Die expression input */}
              <div className="flex shrink-0 items-center gap-1.5">
                <Input
                  value={dieInput}
                  onChange={(e) => handleDieInputChange(e.target.value)}
                  placeholder="d20"
                  spellCheck={false}
                  aria-label="Die expression"
                  className={cn(
                    'h-7 w-20 text-center font-mono text-xs',
                    dieInputError
                      ? 'border-red-400 focus-visible:ring-red-400'
                      : isLightMode
                        ? 'border-zinc-300'
                        : 'border-zinc-700'
                  )}
                />
                {dieInputInfo && !dieInputError && (
                  <span className={cn('text-[11px] font-mono tabular-nums', dimText)}>
                    {dieInputInfo.min}–{dieInputInfo.max}
                  </span>
                )}
              </div>

              {/* Weight indicator */}
              {validationLabel && (
                <span className={cn('shrink-0 font-mono text-xs tabular-nums', validationColor)}>
                  {validationLabel}
                </span>
              )}
            </div>

            {/* Validation hint */}
            {(validation === 'under' || validation === 'over') && (
              <p className={cn('text-xs', dimText)}>
                {validation === 'under'
                  ? `${capacity - used} weight${capacity - used === 1 ? '' : 's'} unassigned — add entries or increase weights.`
                  : `${used - capacity} weight${used - capacity === 1 ? '' : 's'} over — reduce weights or remove entries.`}
              </p>
            )}
            {dieInputError && (
              <p className="text-xs text-red-500">
                Invalid die expression — try &ldquo;d20&rdquo;, &ldquo;2d6&rdquo;,
                &ldquo;d100&rdquo;, etc.
              </p>
            )}
          </CardHeader>

          <CardContent className="pt-0">
            {tableData.entries.length > 0 && (
              <div
                className={cn(
                  'mb-2 flex items-center gap-4 px-2 text-[10px] uppercase tracking-widest',
                  dimText
                )}
              >
                <span className="w-4" />
                <span className="w-12 text-center">Range</span>
                <span className="flex-1">Result</span>
                <span className="w-16 text-center">Weight</span>
                <span className="w-7" />
              </div>
            )}
            <TableEditor
              entries={tableData.entries}
              highlightedEntryId={lastRoll?.entry.id ?? null}
              isLightMode={isLightMode}
              dieMin={dieInfo?.min ?? 1}
              onChange={(entries) => setTableData((prev) => ({ ...prev, entries }))}
            />
          </CardContent>
        </Card>

        {validation === 'ok' && !lastRoll && (
          <p className={cn('text-center text-xs', dimText)}>
            Table is ready — hit{' '}
            <span className={isLightMode ? 'text-zinc-600' : 'text-zinc-400'}>Roll</span> to draw a
            result.
          </p>
        )}
        {tableData.entries.length === 0 && (
          <p className={cn('text-center text-xs', dimText)}>
            Load a template from Actions, or add entries manually.
          </p>
        )}
      </div>

      <SaveStatusIndicator status={saveStatus} />
    </div>
  );
}
