'use client';

import type { SystemRendererProps } from '@/components/stat-block/systems/base-system';
import type { ShadowdarkSpellData } from './types';

export function ShadowdarkSpellRenderer({ data }: SystemRendererProps<ShadowdarkSpellData>) {
  const { name, tier, classes, duration, range, description, source } = data;

  return (
    <div className="font-sans text-black bg-white max-w-2xs mx-auto p-4 space-y-2">
      <h1 className="text-center text-xl font-bold p-1 bg-black text-white uppercase">
        {name || 'New Spell'}
      </h1>

      <p className="text-sm italic leading-snug">
        Tier {tier}
        {classes ? `, ${classes}` : ''}
      </p>

      <div className="text-sm leading-relaxed">
        {duration && (
          <p>
            <span className="font-bold">Duration:</span> {duration}
          </p>
        )}
        {range && (
          <p>
            <span className="font-bold">Range:</span> {range}
          </p>
        )}
      </div>

      {description && <p className="text-sm leading-snug whitespace-pre-wrap">{description}</p>}
    </div>
  );
}
