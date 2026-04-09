'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SaveStatus = 'idle' | 'saving' | 'saved';

export function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'flex items-center gap-1.5',
        'rounded-full border bg-background/90 px-3 py-1.5 text-xs shadow-lg backdrop-blur-sm',
        'pointer-events-none'
      )}
    >
      {status === 'saving' ? (
        <>
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-muted-foreground">Saving…</span>
        </>
      ) : (
        <>
          <Check className="h-3 w-3 text-emerald-500" />
          <span className="text-muted-foreground">Saved</span>
        </>
      )}
    </div>
  );
}
