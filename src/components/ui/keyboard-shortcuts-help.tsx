'use client';

import { Keyboard } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export type ShortcutEntry = {
  keys: string;
  description: string;
};

export type ShortcutGroup = {
  label: string;
  shortcuts: ShortcutEntry[];
};

export function KeyboardShortcutsHelp({ groups }: { groups: ShortcutGroup[] }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Keyboard shortcuts">
          <Keyboard className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 p-3">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Keyboard shortcuts
        </p>
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.shortcuts.map((s) => (
                  <div key={s.keys} className="flex items-center justify-between gap-4">
                    <span className="text-sm">{s.description}</span>
                    <kbd className="shrink-0 rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {s.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
