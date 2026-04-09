'use client';

import type { SystemRendererProps } from '@/components/stat-block/systems/base-system';
import { cn } from '@/lib/utils';
import type { DnD5e2024SpellData } from './types';
import { spellLevelLabel } from './types';

function Divider() {
  return <hr className="my-2 border-t border-border" />;
}

function StatLine({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-1.5 text-sm">
      <span className="font-semibold shrink-0">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

export function DnD5e2024SpellRenderer({
  data,
  className,
}: SystemRendererProps<DnD5e2024SpellData>) {
  const {
    name,
    level,
    school,
    castingTime,
    range,
    components,
    duration,
    classes,
    description,
    atHigherLevels,
    source,
  } = data;

  const levelLabel = spellLevelLabel(level, school);

  const hasFooter = Boolean(classes || source);

  return (
    <div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm p-5 space-y-3 text-sm',
        className
      )}
    >
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold leading-tight">{name || 'New Spell'}</h2>
        <p className="text-muted-foreground italic text-[13px] mt-0.5">{levelLabel}</p>
      </div>

      <Divider />

      {/* Casting block */}
      <div className="space-y-1">
        <StatLine label="Casting Time" value={castingTime} />
        <StatLine label="Range" value={range} />
        <StatLine label="Components" value={components || undefined} />
        <StatLine label="Duration" value={duration} />
      </div>

      <Divider />

      {/* Description */}
      {description && <p className="leading-relaxed whitespace-pre-wrap">{description}</p>}

      {/* At Higher Levels */}
      {atHigherLevels && (
        <p className="leading-relaxed">
          <span className="font-semibold italic">At Higher Levels. </span>
          {atHigherLevels}
        </p>
      )}

      {/* Footer */}
      {hasFooter && (
        <>
          <Divider />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
            {classes && <span>{classes}</span>}
            {source && <span className="ml-auto italic">{source}</span>}
          </div>
        </>
      )}
    </div>
  );
}
