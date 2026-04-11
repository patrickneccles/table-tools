'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatRange, type TableEntry } from './random-table-utils';

type Props = {
  entry: TableEntry;
  range: { min: number; max: number };
  isHighlighted: boolean;
  isLightMode: boolean;
  onChange: (id: string, field: keyof TableEntry, value: string | number) => void;
  onDelete: (id: string) => void;
};

export function TableEntryRow({
  entry,
  range,
  isHighlighted,
  isLightMode,
  onChange,
  onDelete,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry.id,
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors',
        isDragging && 'opacity-50',
        isHighlighted
          ? isLightMode
            ? 'border-orange-300 bg-orange-50'
            : 'border-orange-800 bg-orange-950/30'
          : isLightMode
            ? 'border-zinc-200 bg-white'
            : 'border-zinc-800 bg-zinc-900/50'
      )}
    >
      {/* Drag handle */}
      <Button
        variant="ghost"
        size="icon"
        {...attributes}
        {...listeners}
        tabIndex={-1}
        aria-label="Drag to reorder"
        className={cn(
          'h-6 w-6 shrink-0 cursor-grab touch-none active:cursor-grabbing',
          isLightMode ? 'text-zinc-300 hover:text-zinc-500' : 'text-zinc-700 hover:text-zinc-400'
        )}
      >
        <GripVertical className="h-4 w-4" />
      </Button>

      {/* Range badge */}
      <Badge
        variant="outline"
        className={cn(
          'w-12 shrink-0 justify-center font-mono tabular-nums font-normal cursor-default',
          isLightMode ? 'text-zinc-400 border-zinc-200' : 'text-zinc-500 border-zinc-700'
        )}
      >
        {formatRange(range)}
      </Badge>

      {/* Result input */}
      <Input
        value={entry.result}
        onChange={(e) => onChange(entry.id, 'result', e.target.value)}
        placeholder="Result…"
        className={cn(
          'h-7 flex-1 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0',
          isLightMode
            ? 'text-zinc-800 placeholder:text-zinc-300'
            : 'text-zinc-100 placeholder:text-zinc-600'
        )}
      />

      {/* Weight controls */}
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          tabIndex={-1}
          disabled={entry.weight <= 1}
          onClick={() => onChange(entry.id, 'weight', entry.weight - 1)}
          aria-label="Decrease weight"
          className="h-6 w-6 rounded"
        >
          <span className="text-xs leading-none">−</span>
        </Button>
        <span
          className={cn(
            'w-5 text-center text-xs tabular-nums',
            isLightMode ? 'text-zinc-600' : 'text-zinc-400'
          )}
        >
          {entry.weight}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          tabIndex={-1}
          onClick={() => onChange(entry.id, 'weight', entry.weight + 1)}
          aria-label="Increase weight"
          className="h-6 w-6 rounded"
        >
          <span className="text-xs leading-none">+</span>
        </Button>
      </div>

      {/* Delete */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            tabIndex={-1}
            onClick={() => onDelete(entry.id)}
            aria-label="Delete entry"
            className={cn(
              'h-7 w-7 shrink-0',
              isLightMode
                ? 'text-zinc-300 hover:bg-red-50 hover:text-red-600'
                : 'text-zinc-600 hover:bg-red-950/30 hover:text-red-400'
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete entry</TooltipContent>
      </Tooltip>
    </div>
  );
}
