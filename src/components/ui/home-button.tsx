'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsLightMode } from '@/hooks/use-is-light-mode';
import { cn } from '@/lib/utils';

export function HomeButton() {
  const isLightMode = useIsLightMode();
  return (
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
      <Link href="/">
        <Home className="h-3 w-3" />
        <span className="ml-1">Home</span>
      </Link>
    </Button>
  );
}
