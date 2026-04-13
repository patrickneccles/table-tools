'use client';

import { useRef } from 'react';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Bold, ChevronDown, Italic, Plus, Table } from 'lucide-react';

const TABLE_TEMPLATE = `| Header | Header |
| ------ | ------ |
| Cell   | Cell   |`;

type InsertTemplate = { label: string; template: string };

type Props = {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  isLightMode: boolean;
  insertTemplates?: InsertTemplate[];
};

/**
 * Wraps or unwraps a selection with a markdown marker pair.
 *
 * Unwrap is triggered in two cases:
 *   1. The selection itself includes the markers (e.g. user selected "**foo**")
 *   2. The markers sit just outside the selection (e.g. cursor is inside *foo*)
 *
 * The inner-character check (selected[pl] !== markerChar) prevents matching a
 * longer marker — so italic (*) won't accidentally strip one layer from bold (**).
 */
function toggleMarker(
  value: string,
  start: number,
  end: number,
  prefix: string,
  suffix: string
): { next: string; cursorStart: number; cursorEnd: number } {
  const pl = prefix.length;
  const sl = suffix.length;
  const markerChar = prefix[pl - 1];

  if (start === end) {
    // No selection — insert empty markers and place cursor between them
    const next = value.slice(0, start) + prefix + suffix + value.slice(start);
    const pos = start + pl;
    return { next, cursorStart: pos, cursorEnd: pos };
  }

  const selected = value.slice(start, end);

  // Case 1: selection wraps the markers (e.g. user selected "**foo**")
  if (
    selected.length > pl + sl &&
    selected.startsWith(prefix) &&
    selected.endsWith(suffix) &&
    selected[pl] !== markerChar &&
    selected[selected.length - sl - 1] !== markerChar
  ) {
    const inner = selected.slice(pl, selected.length - sl);
    const next = value.slice(0, start) + inner + value.slice(end);
    return { next, cursorStart: start, cursorEnd: start + inner.length };
  }

  // Case 2: markers sit just outside the current selection
  if (
    start >= pl &&
    value.slice(start - pl, start) === prefix &&
    value.slice(end, end + sl) === suffix
  ) {
    const next = value.slice(0, start - pl) + selected + value.slice(end + sl);
    return { next, cursorStart: start - pl, cursorEnd: start - pl + selected.length };
  }

  // Default: wrap
  const next = value.slice(0, start) + prefix + selected + suffix + value.slice(end);
  return { next, cursorStart: start + pl, cursorEnd: start + pl + selected.length };
}

export function MarkdownEditor({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  isLightMode,
  insertTemplates,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  // Persists cursor position so inserts work even after focus leaves the textarea
  // (e.g. when opening a dropdown menu)
  const cursorRef = useRef<number>(0);

  function applyFormat(prefix: string, suffix: string) {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: start, selectionEnd: end } = ta;
    const { next, cursorStart, cursorEnd } = toggleMarker(value, start, end, prefix, suffix);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(cursorStart, cursorEnd);
    });
  }

  function insertSnippet(snippet: string) {
    const at = cursorRef.current;
    const before = value.slice(0, at);
    const after = value.slice(at);
    const sep = before.length > 0 && !before.endsWith('\n') ? '\n\n' : '';
    const trail = after.length > 0 && !after.startsWith('\n') ? '\n\n' : '';
    const inserted = sep + snippet;
    onChange(before + inserted + trail + after);

    // Select the name placeholder inside the first **Name.** pair so the user
    // can immediately type to replace it.
    requestAnimationFrame(() => {
      const ta = ref.current;
      if (!ta) return;
      ta.focus();
      const insertStart = before.length + sep.length;
      const nameMatch = /\*\*([^*.]+)\.\*\*/.exec(snippet);
      if (nameMatch) {
        const nameStart = insertStart + nameMatch.index + 2; // skip opening **
        ta.setSelectionRange(nameStart, nameStart + nameMatch[1].length);
      } else {
        ta.setSelectionRange(insertStart, insertStart + snippet.length);
      }
    });
  }

  function insertTable() {
    const ta = ref.current;
    if (!ta) return;
    const at = ta.selectionEnd;
    const before = value.slice(0, at);
    const sep = before.length > 0 && !before.endsWith('\n') ? '\n\n' : '';
    const insert = sep + TABLE_TEMPLATE + '\n';
    onChange(before + insert + value.slice(at));
    requestAnimationFrame(() => ta.focus());
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;
    if (e.key === 'b' || e.key === 'B') {
      e.preventDefault();
      e.stopPropagation();
      applyFormat('**', '**');
    } else if (e.key === 'i' || e.key === 'I') {
      e.preventDefault();
      e.stopPropagation();
      applyFormat('*', '*');
    }
  }

  const toolbarBtn = cn(
    'rounded p-1 transition-colors',
    isLightMode
      ? 'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800'
      : 'text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100'
  );

  const insertBtnCls = cn(
    'flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-medium transition-colors',
    isLightMode
      ? 'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800'
      : 'text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100'
  );

  return (
    <div>
      <Label
        htmlFor={id}
        className={cn('text-xs transition-colors', isLightMode ? 'text-zinc-600' : 'text-zinc-400')}
      >
        {label}
      </Label>
      <div
        className={cn(
          'mt-1 rounded-md border overflow-hidden',
          isLightMode ? 'border-zinc-300' : 'border-zinc-700'
        )}
      >
        {/* Toolbar */}
        <div
          className={cn(
            'flex items-center gap-0.5 px-2 py-1 border-b',
            isLightMode ? 'bg-zinc-50 border-zinc-300' : 'bg-zinc-800/80 border-zinc-700'
          )}
        >
          <button
            type="button"
            title="Bold (⌘B)"
            className={toolbarBtn}
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('**', '**');
            }}
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Italic (⌘I)"
            className={toolbarBtn}
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('*', '*');
            }}
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <div className={cn('w-px h-3.5 mx-1', isLightMode ? 'bg-zinc-300' : 'bg-zinc-600')} />
          <button
            type="button"
            title="Insert table"
            className={cn(toolbarBtn, 'flex items-center gap-1 pr-2')}
            onMouseDown={(e) => {
              e.preventDefault();
              insertTable();
            }}
          >
            <Table className="h-3.5 w-3.5" />
            <span className="text-[10px]">Table</span>
          </button>

          {/* Insert templates */}
          {insertTemplates && insertTemplates.length > 0 && (
            <>
              <div className={cn('w-px h-3.5 mx-1', isLightMode ? 'bg-zinc-300' : 'bg-zinc-600')} />
              {insertTemplates.length === 1 ? (
                <button
                  type="button"
                  className={insertBtnCls}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertSnippet(insertTemplates[0].template);
                  }}
                >
                  <Plus className="h-3 w-3" />
                  {insertTemplates[0].label}
                </button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className={insertBtnCls}>
                      <Plus className="h-3 w-3" />
                      Insert
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[160px]">
                    {insertTemplates.map((t) => (
                      <DropdownMenuItem key={t.label} onSelect={() => insertSnippet(t.template)}>
                        {t.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>

        {/* Textarea */}
        <textarea
          ref={ref}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          onSelect={(e) => {
            cursorRef.current = e.currentTarget.selectionEnd;
          }}
          onMouseUp={(e) => {
            cursorRef.current = e.currentTarget.selectionEnd;
          }}
          onKeyUp={(e) => {
            cursorRef.current = e.currentTarget.selectionEnd;
          }}
          placeholder={placeholder}
          rows={6}
          className={cn(
            'w-full resize-y bg-transparent px-3 py-2 text-sm leading-relaxed outline-none font-mono',
            isLightMode
              ? 'text-zinc-900 placeholder:text-zinc-400'
              : 'text-zinc-100 placeholder:text-zinc-600'
          )}
        />
      </div>
    </div>
  );
}
