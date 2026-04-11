'use client';

import { useIsLightMode } from '@/hooks/use-is-light-mode';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  Map,
  Wrench,
  BarChart2,
  Table2,
  Users,
  Monitor,
  AlertCircle,
} from 'lucide-react';
import { ToolPageHeader } from '@/components/layout/tool-page-header';

type StatusBadgeProps = {
  status: 'live' | 'needs-work' | 'planned' | 'later';
  isLightMode: boolean;
};

function StatusBadge({ status, isLightMode }: StatusBadgeProps) {
  const configs = {
    live: {
      label: 'Live',
      icon: <CheckCircle2 className="h-3 w-3" />,
      className: isLightMode
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-emerald-950/50 text-emerald-400 border-emerald-800',
    },
    'needs-work': {
      label: 'Needs work',
      icon: <AlertCircle className="h-3 w-3" />,
      className: isLightMode
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-amber-950/50 text-amber-400 border-amber-800',
    },
    planned: {
      label: 'Planned',
      icon: <Wrench className="h-3 w-3" />,
      className: isLightMode
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : 'bg-blue-950/50 text-blue-400 border-blue-800',
    },
    later: {
      label: 'Later',
      icon: <Clock className="h-3 w-3" />,
      className: isLightMode
        ? 'bg-zinc-100 text-zinc-500 border-zinc-200'
        : 'bg-zinc-800 text-zinc-500 border-zinc-700',
    },
  };

  const { label, icon, className } = configs[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border',
        className
      )}
    >
      {icon}
      {label}
    </span>
  );
}

type RoadmapItem = {
  title: string;
  description: string;
  status: 'live' | 'needs-work' | 'planned' | 'later';
  icon: React.ReactNode;
};

export default function RoadmapPage() {
  const isLightMode = useIsLightMode();

  const currentTools: RoadmapItem[] = [
    {
      title: 'Mood Board',
      description: 'Soundboard with looping ambience, one-shot effects, and ducking.',
      status: 'needs-work',
      icon: <span className="text-base">🎵</span>,
    },
    {
      title: 'Stat Block Generator',
      description:
        'Multi-system stat block editor with live preview, undo/redo, and import/export.',
      status: 'live',
      icon: <span className="text-base">📜</span>,
    },
    {
      title: 'Hex Map',
      description: 'Hex grid painter with stamps, flood fill, text labels, and import/export.',
      status: 'live',
      icon: <span className="text-base">🗺️</span>,
    },
    {
      title: 'Spell Block Generator',
      description: 'Multi-system spell block editor with live preview and SRD templates.',
      status: 'live',
      icon: <span className="text-base">✨</span>,
    },
    {
      title: 'Dice Probability Calculator',
      description:
        'Visualize roll distributions for any expression — great for designing encounters, setting DCs, and evaluating ability score methods.',
      status: 'live',
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      title: 'Random Tables',
      description:
        'Build weighted tables for encounters, loot, NPC quirks, and more. Roll with one click.',
      status: 'live',
      icon: <Table2 className="h-5 w-5" />,
    },
  ];

  const upcomingTools: RoadmapItem[] = [
    {
      title: 'NPC Generator',
      description:
        'Quickly generate names, appearance, personality, and motivation. Export directly to Stat Block.',
      status: 'planned',
      icon: <Users className="h-5 w-5" />,
    },
  ];

  const laterItems: RoadmapItem[] = [
    {
      title: 'Digital GM Screen',
      description:
        'A composable dashboard that surfaces widgets from across the suite — dice, random tables, mood board controls, and stat/spell quick-reference — in a single customizable view.',
      status: 'later',
      icon: <Monitor className="h-5 w-5" />,
    },
    {
      title: 'Pathfinder 2e Systems',
      description: 'Stat block and spell block support for Pathfinder 2e.',
      status: 'later',
      icon: <span className="text-base">⚔️</span>,
    },
    {
      title: 'Spell Book Compiler',
      description: 'Select multiple spells and export as a single formatted print/PDF view.',
      status: 'later',
      icon: <span className="text-base">📖</span>,
    },
  ];

  const sectionClass = cn(
    'rounded-2xl border p-6',
    isLightMode ? 'bg-white border-zinc-200' : 'bg-zinc-900/50 border-zinc-800'
  );

  const dividerClass = cn('border-t my-4', isLightMode ? 'border-zinc-100' : 'border-zinc-800');

  function ItemRow({ item }: { item: RoadmapItem }) {
    const inner = (
      <div className="flex items-start gap-4 py-4">
        <div
          className={cn(
            'mt-0.5 flex-shrink-0 p-2 rounded-lg',
            isLightMode ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-800 text-zinc-400'
          )}
        >
          {item.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={cn('font-medium text-sm', isLightMode ? 'text-zinc-800' : 'text-zinc-100')}
            >
              {item.title}
            </span>
            <StatusBadge status={item.status} isLightMode={isLightMode} />
          </div>
          <p className={cn('text-sm', isLightMode ? 'text-zinc-500' : 'text-zinc-400')}>
            {item.description}
          </p>
        </div>
      </div>
    );

    return inner;
  }

  return (
    <div
      className={cn(
        'flex-1 transition-colors duration-300',
        isLightMode ? 'bg-[#f5f5f7]' : 'bg-[#0a0a0b]'
      )}
    >
      <ToolPageHeader
        heading="What's being built"
        subtitle="A growing prep toolkit for TTRPG players, GMs, and streamers"
        icon={<Map className="h-5 w-5" />}
        iconColor="#71717a"
        maxWidth="max-w-xl"
      />
      <div className="container mx-auto max-w-xl px-4 py-8">
        <div className="space-y-6">
          {/* Current Tools */}
          <section>
            <h2
              className={cn(
                'text-xs font-semibold uppercase tracking-widest mb-3',
                isLightMode ? 'text-zinc-400' : 'text-zinc-500'
              )}
            >
              Current Tools
            </h2>
            <div className={sectionClass}>
              {currentTools.map((item, i) => (
                <div key={item.title}>
                  {i > 0 && <div className={dividerClass} />}
                  <ItemRow item={item} />
                </div>
              ))}
            </div>
          </section>

          {/* Coming Up */}
          <section>
            <h2
              className={cn(
                'text-xs font-semibold uppercase tracking-widest mb-3',
                isLightMode ? 'text-zinc-400' : 'text-zinc-500'
              )}
            >
              Coming Up
            </h2>
            <div className={sectionClass}>
              {upcomingTools.map((item, i) => (
                <div key={item.title}>
                  {i > 0 && <div className={dividerClass} />}
                  <ItemRow item={item} />
                </div>
              ))}
            </div>
          </section>

          {/* Later */}
          <section>
            <h2
              className={cn(
                'text-xs font-semibold uppercase tracking-widest mb-3',
                isLightMode ? 'text-zinc-400' : 'text-zinc-500'
              )}
            >
              Later
            </h2>
            <div className={sectionClass}>
              {laterItems.map((item, i) => (
                <div key={item.title}>
                  {i > 0 && <div className={dividerClass} />}
                  <ItemRow item={item} />
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <p
            className={cn(
              'text-xs text-center pt-2',
              isLightMode ? 'text-zinc-400' : 'text-zinc-600'
            )}
          >
            Suggestions?{' '}
            <a
              href="mailto:patrick@penpyre.com"
              className={cn(
                'underline underline-offset-2 transition-colors',
                isLightMode ? 'hover:text-zinc-700' : 'hover:text-zinc-400'
              )}
            >
              patrick@penpyre.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
