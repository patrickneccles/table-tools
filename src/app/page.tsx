'use client';

import { useIsLightMode } from '@/hooks/use-is-light-mode';
import { cn } from '@/lib/utils';
import { isToolEnabled, type ToolId } from '@/lib/feature-flags';
import {
  ArrowRight,
  BarChart2,
  HardHat,
  Hexagon,
  Mail,
  Map,
  Music,
  PanelTopDashed,
  Scroll,
  Table2,
  Toolbox,
} from 'lucide-react';
import Link from 'next/link';

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  isLightMode: boolean;
  badge?: string;
  disabled?: boolean;
}

function ToolCard({
  title,
  description,
  href,
  icon,
  color,
  isLightMode,
  badge,
  disabled,
}: ToolCardProps) {
  const card = (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 transition-all duration-300',
        'border',
        disabled
          ? cn(
              'opacity-50',
              isLightMode ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/30 border-zinc-800/60'
            )
          : cn(
              'hover:scale-[1.02] hover:shadow-2xl',
              isLightMode
                ? 'bg-white border-zinc-200 shadow-sm hover:border-zinc-300'
                : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
            )
      )}
    >
      {/* Gradient accent (enabled only) */}
      {!disabled && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${color}15 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Badge */}
      {(badge || disabled) && (
        <div
          className={cn(
            'absolute top-4 right-4 text-[10px] font-medium px-2 py-1 rounded-full',
            disabled
              ? isLightMode
                ? 'bg-amber-100 text-amber-700'
                : 'bg-amber-950/60 text-amber-500'
              : isLightMode
                ? 'bg-zinc-100 text-zinc-600'
                : 'bg-zinc-800 text-zinc-400'
          )}
        >
          {disabled ? (
            <span className="flex items-center gap-1">
              <HardHat className="h-2.5 w-2.5" />
              WIP
            </span>
          ) : (
            badge
          )}
        </div>
      )}

      {/* Content */}
      <div className="relative">
        <div
          className="inline-flex p-3 rounded-xl mb-4"
          style={{
            background: `${color}20`,
            color: disabled ? undefined : color,
          }}
        >
          {icon}
        </div>

        <h2
          className={cn(
            'text-xl font-semibold mb-2 transition-colors',
            isLightMode ? 'text-zinc-800' : 'text-white'
          )}
        >
          {title}
        </h2>

        <p className={cn('text-sm mb-4', isLightMode ? 'text-zinc-500' : 'text-zinc-400')}>
          {description}
        </p>

        {!disabled && (
          <div
            className={cn(
              'inline-flex items-center gap-1 text-sm font-medium transition-colors',
              'group-hover:gap-2'
            )}
            style={{ color }}
          >
            Open tool
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        )}
      </div>
    </div>
  );

  if (disabled) return <div className="cursor-default">{card}</div>;
  return (
    <Link href={href} className="group block">
      {card}
    </Link>
  );
}

export default function HomePage() {
  const isLightMode = useIsLightMode();

  const tools = (
    [
      {
        toolId: 'mood-board',
        title: 'Mood Board',
        description:
          'Virtual soundboard for immersive audio experiences. Perfect for TTRPGs, podcasts, and streaming.',
        href: '/mood-board',
        icon: <Music className="h-6 w-6" />,
        color: '#22c55e',
        badge: 'Audio',
      },
      {
        toolId: 'stat-blocks',
        title: 'Stat Block Generator',
        description:
          'Create and print D&D 5e stat blocks. Includes SRD templates with auto-calculations.',
        href: '/stat-blocks',
        icon: <PanelTopDashed className="h-6 w-6" />,
        color: '#f59e0b',
        badge: 'Print',
      },
      {
        toolId: 'hex-map',
        title: 'Hex map',
        description:
          'Draw overland or battle hex grids with colors, Lucide stamps, and JSON export.',
        href: '/hex-map',
        icon: <Hexagon className="h-6 w-6" />,
        color: '#8b5cf6',
        badge: 'Maps',
      },
      {
        toolId: 'spell-blocks',
        title: 'Spell Block Generator',
        description:
          'Create and export D&D 5e 2024 spell blocks with live preview and JSON import/export.',
        href: '/spell-blocks',
        icon: <Scroll className="h-6 w-6" />,
        color: '#3b82f6',
        badge: 'Spells',
      },
      {
        toolId: 'dice',
        title: 'Dice Probability',
        description:
          'Visualize roll distributions for any expression. Set DCs, design encounters, and compare methods.',
        href: '/dice',
        icon: <BarChart2 className="h-6 w-6" />,
        color: '#dc2626',
        badge: 'Prep',
      },
      {
        toolId: 'random-tables',
        title: 'Random Tables',
        description:
          'Build weighted tables for encounters, loot, NPC quirks, and more. Roll with one click.',
        href: '/random-tables',
        icon: <Table2 className="h-6 w-6" />,
        color: '#f97316',
        badge: 'Prep',
      },
    ] as (Omit<ToolCardProps, 'isLightMode' | 'disabled'> & { toolId: ToolId })[]
  )
    .map((t) => ({ ...t, disabled: !isToolEnabled(t.toolId), isLightMode }))
    .sort((a, b) => Number(a.disabled) - Number(b.disabled));

  return (
    <div
      className={cn(
        'flex-1 transition-colors duration-300',
        isLightMode ? 'bg-[#f5f5f7]' : 'bg-[#0a0a0b]'
      )}
    >
      {/* Subtle gradient background */}
      <div
        className={cn(
          'fixed inset-0 pointer-events-none',
          isLightMode ? 'opacity-30' : 'opacity-50'
        )}
        style={{
          background: `
            radial-gradient(ellipse at 20% 0%, #22c55e10 0%, transparent 50%),
            radial-gradient(ellipse at 80% 0%, #f59e0b10 0%, transparent 50%)
          `,
        }}
      />

      <div className="relative container mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-center mb-16">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-xl', isLightMode ? 'bg-zinc-900/5' : 'bg-white/5')}>
              <Toolbox className={cn('h-6 w-6', isLightMode ? 'text-zinc-700' : 'text-zinc-300')} />
            </div>
            <span
              className={cn('font-semibold text-lg', isLightMode ? 'text-zinc-800' : 'text-white')}
            >
              Table Tools
            </span>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-16">
          <h1
            className={cn(
              'text-4xl sm:text-5xl font-bold tracking-tight mb-4',
              isLightMode ? 'text-zinc-800' : 'text-white'
            )}
          >
            Creative Tools for
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-amber-500 bg-clip-text text-transparent">
              Tabletop Gaming
            </span>
          </h1>
          <p
            className={cn(
              'text-lg max-w-xl mx-auto',
              isLightMode ? 'text-zinc-500' : 'text-zinc-400'
            )}
          >
            A collection of tools to enhance your TTRPG sessions, streaming, and creative projects.
          </p>
        </div>

        {/* Tool Cards */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 mb-16">
          {tools.map((tool) => (
            <ToolCard key={tool.href} {...tool} isLightMode={isLightMode} />
          ))}
        </div>

        {/* Coming Soon / Builder teaser */}
        <div
          className={cn(
            'rounded-2xl p-6 text-center border flex flex-col items-center gap-4',
            isLightMode ? 'bg-white/50 border-zinc-200' : 'bg-zinc-900/30 border-zinc-800'
          )}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Link
              href="/roadmap"
              className={cn(
                'inline-flex items-center gap-1.5 text-sm transition-colors',
                isLightMode
                  ? 'text-zinc-500 hover:text-zinc-800'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <Map className="h-4 w-4" />
              View roadmap
            </Link>
          </div>
          <p className={cn('text-xs', isLightMode ? 'text-zinc-400' : 'text-zinc-500')}>
            Reach out with requests or suggestions!
          </p>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <a className="text-sm" href="mailto:patrick@penpyre.com">
              patrick@penpyre.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
