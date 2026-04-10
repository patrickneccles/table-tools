'use client';

import { useLayoutEffect, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { useIsLightMode } from '@/hooks/use-is-light-mode';
import { cn } from '@/lib/utils';
import {
  emitThemeChange,
  subscribeTheme,
  getThemeSnapshot,
  getThemeServerSnapshot,
} from '@/lib/theme-store';
import { Moon, Sun, Toolbox } from 'lucide-react';
import Link from 'next/link';

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const isLightMode = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isLight = savedTheme
      ? savedTheme === 'light'
      : document.documentElement.classList.contains('light');
    document.documentElement.classList.toggle('light', isLight);
    emitThemeChange();
  }, []);

  const toggleTheme = () => {
    const newIsLight = !isLightMode;
    document.documentElement.classList.toggle('light', newIsLight);
    localStorage.setItem('theme', newIsLight ? 'light' : 'dark');
    emitThemeChange();
  };

  // Avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={cn(
        'rounded-full text-xs gap-1.5',
        isLightMode
          ? 'bg-zinc-900/10 border border-zinc-900/10 text-zinc-600 hover:bg-zinc-900/20 hover:text-zinc-800'
          : 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
      )}
    >
      {isLightMode ? (
        <>
          <Moon className="h-3 w-3" />
          <span>Dark</span>
        </>
      ) : (
        <>
          <Sun className="h-3 w-3" />
          <span>Light</span>
        </>
      )}
    </Button>
  );
}

export function AppFooter() {
  const isLightMode = useIsLightMode();
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient) {
    return null;
  }

  return (
    <footer
      className={cn(
        'print:hidden border-t transition-colors',
        isLightMode ? 'border-zinc-200 bg-white/50' : 'border-zinc-800 bg-zinc-900/50'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className={cn(
            'flex items-center gap-1.5 text-xs transition-colors',
            isLightMode ? 'text-zinc-400 hover:text-zinc-700' : 'text-zinc-500 hover:text-zinc-200'
          )}
        >
          <Toolbox className="h-3 w-3" />
          Table Tools
        </Link>
        <ThemeToggle />
      </div>
    </footer>
  );
}
