'use client';

import { useIsLightMode } from '@/hooks/use-is-light-mode';
import { cn } from '@/lib/utils';
import { HardHat } from 'lucide-react';
import Link from 'next/link';

type Props = {
  toolName: string;
};

export function WipPage({ toolName }: Props) {
  const isLightMode = useIsLightMode();

  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center transition-colors duration-300',
        isLightMode
          ? 'bg-gradient-to-b from-zinc-50 to-zinc-100'
          : 'bg-gradient-to-b from-zinc-900 to-zinc-950'
      )}
    >
      <div
        className={cn(
          'rounded-2xl p-5',
          isLightMode ? 'bg-amber-50 text-amber-600' : 'bg-amber-950/40 text-amber-400'
        )}
      >
        <HardHat className="h-10 w-10" />
      </div>

      <div className="space-y-2">
        <h1
          className={cn(
            'text-2xl font-bold tracking-tight',
            isLightMode ? 'text-zinc-800' : 'text-white'
          )}
        >
          {toolName} is a work in progress
        </h1>
        <p className={cn('text-sm', isLightMode ? 'text-zinc-500' : 'text-zinc-400')}>
          This tool isn&apos;t available yet. Check back soon.
        </p>
      </div>

      <Link
        href="/"
        className={cn(
          'mt-2 text-sm underline-offset-4 hover:underline transition-colors',
          isLightMode ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
        )}
      >
        Back to all tools
      </Link>
    </div>
  );
}
