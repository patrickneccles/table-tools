'use client';

import { useLayoutEffect, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { useIsLightMode } from '@/hooks/use-is-light-mode';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';

const emptySubscribe = () => () => {};

const themeListeners = new Set<() => void>();

function emitThemeChange() {
  themeListeners.forEach((cb) => cb());
}

function subscribeTheme(onStoreChange: () => void) {
  themeListeners.add(onStoreChange);
  return () => {
    themeListeners.delete(onStoreChange);
  };
}

function getThemeIsLightClientSnapshot(): boolean {
  const savedTheme = localStorage.getItem('theme');
  return savedTheme ? savedTheme === 'light' : document.documentElement.classList.contains('light');
}

function getThemeServerSnapshot(): boolean {
  return false;
}

export function ThemeToggle() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const isLightMode = useSyncExternalStore(
    subscribeTheme,
    getThemeIsLightClientSnapshot,
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
        <span className={cn('text-xs', isLightMode ? 'text-zinc-400' : 'text-zinc-500')}>
          Table Tools
        </span>
        <ThemeToggle />
      </div>
    </footer>
  );
}
