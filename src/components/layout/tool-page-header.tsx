'use client';

import React from 'react';
import { HomeButton } from '@/components/ui/home-button';
import { useIsLightMode } from '@/hooks/use-is-light-mode';
import { cn } from '@/lib/utils';

type Props = {
  heading: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  /** Hex color used for the icon background tint and foreground, e.g. '#dc2626' */
  iconColor?: string;
  /** Tailwind max-width class, e.g. 'max-w-4xl'. Defaults to 'max-w-7xl'. */
  maxWidth?: string;
  /** Right-side toolbar actions. HomeButton is always rendered first. */
  children?: React.ReactNode;
};

export function ToolPageHeader({
  heading,
  subtitle,
  icon,
  iconColor,
  maxWidth = 'max-w-7xl',
  children,
}: Props) {
  const isLightMode = useIsLightMode();

  return (
    <header
      className={cn(
        'sticky top-0 z-50 shrink-0 border-b backdrop-blur-sm transition-colors print:hidden',
        isLightMode ? 'border-zinc-200 bg-white/80' : 'border-zinc-800 bg-zinc-900/80'
      )}
    >
      <div
        className={cn(
          'mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-4 lg:flex-nowrap',
          maxWidth
        )}
      >
        {/* Left: icon + title */}
        <div className="flex items-center gap-3">
          {icon && iconColor && (
            <div
              className="rounded-xl p-2 shrink-0"
              style={{ background: `${iconColor}20`, color: iconColor }}
            >
              {icon}
            </div>
          )}
          <div>
            <h1
              className={cn(
                'text-xl font-bold tracking-tight transition-colors',
                isLightMode ? 'text-zinc-800' : 'text-white'
              )}
            >
              {heading}
            </h1>
            {subtitle && (
              <p className={cn('text-sm', isLightMode ? 'text-zinc-500' : 'text-zinc-400')}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: home + toolbar actions */}
        <div className="flex items-center gap-2">
          <HomeButton />
          {children}
        </div>
      </div>
    </header>
  );
}
