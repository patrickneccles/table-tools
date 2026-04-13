'use client';

import type { SystemRendererProps } from '@/components/stat-block/systems/base-system';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { cn } from '@/lib/utils';
import type { DnD5e2024SpellData } from './types';
import { spellLevelLabel } from './types';

const MAROON = '#5b160c';

function Divider() {
  return <hr className="my-2 border-t" style={{ borderColor: MAROON }} />;
}

function CastingLine({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <p className="font-sans indent-[-1rem] pl-4">
      <span className="font-semibold">{label}</span>: {value}
    </p>
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
    source,
  } = data;

  const levelLabel = spellLevelLabel(level, school);

  return (
    <div
      className={cn(
        'bg-white font-serif text-stone-900 text-sm w-sm rounded-md shadow-lg',
        className
      )}
      style={{ border: '3px double #64748b' }}
    >
      <div className="bg-yellow-100/10 p-4 space-y-2">
        {/* Name */}
        <div>
          <h2
            className="text-lg font-semibold tracking-wide leading-tight"
            style={{ color: MAROON, fontVariant: 'small-caps' }}
          >
            {name || 'New Spell'}
          </h2>
          <p className="italic text-stone-900 mt-0.5">
            {levelLabel}
            {classes && ` (${classes})`}
          </p>
        </div>

        {/* Casting properties — no rule before, rule after */}
        <div>
          <CastingLine label="Casting Time" value={castingTime} />
          <CastingLine label="Range" value={range} />
          <CastingLine label="Components" value={components} />
          <CastingLine label="Duration" value={duration} />
        </div>

        {/* Description body */}
        <MarkdownContent content={description} />

        {/* Footer: classes + source */}
        {source && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
            {<span className="ml-auto italic">{source}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
