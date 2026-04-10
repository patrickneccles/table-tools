'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { useIsLightMode } from '@/hooks/use-is-light-mode';
import { ArrowLeft, Loader2, Wrench } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Dynamically import BoardBuilder with SSR disabled to prevent hydration errors
// @dnd-kit generates different aria-describedby IDs on server vs client
const BoardBuilder = dynamic(
  () => import('@/components/mood-board/builder').then((mod) => mod.BoardBuilder),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm">Loading builder...</span>
        </div>
      </div>
    ),
  }
);

export default function BuilderPage() {
  const isLightMode = useIsLightMode();

  return (
    <div
      className={cn(
        'flex-1 transition-colors duration-300',
        isLightMode ? 'bg-[#f0f0f2]' : 'bg-[#0a0a0b]'
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back link - pill button */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                'rounded-full text-xs',
                isLightMode
                  ? 'bg-zinc-900/10 border border-zinc-900/10 text-zinc-600 hover:bg-zinc-900/20 hover:text-zinc-800'
                  : 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
              )}
            >
              <Link href="/mood-board">
                <ArrowLeft className="h-3 w-3" />
                <span className="ml-1">Back</span>
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'p-2 rounded-xl',
                  isLightMode ? 'bg-violet-100 text-violet-600' : 'bg-violet-900/20 text-violet-400'
                )}
              >
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h1
                  className={cn(
                    'text-xl font-bold tracking-tight',
                    isLightMode ? 'text-zinc-800' : 'text-white'
                  )}
                >
                  Mood Board Builder
                </h1>
                <p className={cn('text-sm', isLightMode ? 'text-zinc-500' : 'text-zinc-400')}>
                  Create and customize your own soundboard
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Builder */}
        <div>
          <BoardBuilder
            isLightMode={isLightMode}
            onSave={(config) => {
              // In a real app, this would save to a database
              console.log('Saving board config:', config);
              // Could also save to localStorage for persistence
              localStorage.setItem(`moodboard-${config.id}`, JSON.stringify(config));
            }}
          />
        </div>
      </div>
    </div>
  );
}
