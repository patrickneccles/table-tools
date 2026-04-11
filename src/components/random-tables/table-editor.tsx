'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { computeRanges, newEntry, type TableEntry } from './random-table-utils';
import { TableEntryRow } from './table-entry-row';

type Props = {
  entries: TableEntry[];
  highlightedEntryId: string | null;
  isLightMode: boolean;
  dieMin?: number;
  onChange: (entries: TableEntry[]) => void;
};

export function TableEditor({
  entries,
  highlightedEntryId,
  isLightMode,
  dieMin = 1,
  onChange,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ranges = useMemo(() => computeRanges(entries, dieMin), [entries, dieMin]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = entries.findIndex((e) => e.id === active.id);
        const newIndex = entries.findIndex((e) => e.id === over.id);
        onChange(arrayMove(entries, oldIndex, newIndex));
      }
    },
    [entries, onChange]
  );

  const handleEntryChange = useCallback(
    (id: string, field: keyof TableEntry, value: string | number) => {
      onChange(entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
    },
    [entries, onChange]
  );

  const handleDelete = useCallback(
    (id: string) => {
      onChange(entries.filter((e) => e.id !== id));
    },
    [entries, onChange]
  );

  const handleAdd = useCallback(() => {
    onChange([...entries, newEntry()]);
  }, [entries, onChange]);

  return (
    <div className="space-y-1.5">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={entries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          {entries.map((entry, i) => (
            <TableEntryRow
              key={entry.id}
              entry={entry}
              range={ranges[i]}
              isHighlighted={entry.id === highlightedEntryId}
              isLightMode={isLightMode}
              onChange={handleEntryChange}
              onDelete={handleDelete}
            />
          ))}
        </SortableContext>
      </DndContext>

      {entries.length === 0 && (
        <p
          className={cn(
            'py-10 text-center text-sm',
            isLightMode ? 'text-zinc-400' : 'text-zinc-600'
          )}
        >
          No entries yet — add one below or load a template.
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className={cn(
          'w-full border-dashed',
          isLightMode
            ? 'border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700'
            : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
        )}
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Add entry
      </Button>
    </div>
  );
}
