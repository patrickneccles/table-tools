'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { FeatureEntry, FeatureSectionKey } from './types';
import { FEATURE_SECTION_LABELS } from './types';
import {
  getInputClassName,
  getInputWithPlaceholderClassName,
  FormField,
  TextInput,
  NumberInput,
  EditorCard,
} from '@/components/editor/editor-primitives';

// Re-export shared primitives for backward compatibility
export {
  getInputClassName,
  getInputWithPlaceholderClassName,
  FormField,
  TextInput,
  NumberInput,
  EditorCard,
};

// ============================================================================
// FeatureEditor Component - Collapsible trait/action section editor
// ============================================================================

type FeatureEditorProps = {
  section: FeatureSectionKey;
  entries: FeatureEntry[] | undefined;
  onAdd: () => void;
  onUpdate: (index: number, field: 'name' | 'description', value: string) => void;
  onRemove: (index: number) => void;
  defaultOpen?: boolean;
  isLightMode?: boolean;
};

export function FeatureEditor({
  section,
  entries,
  onAdd,
  onUpdate,
  onRemove,
  defaultOpen = false,
  isLightMode = false,
}: FeatureEditorProps) {
  const label = FEATURE_SECTION_LABELS[section];
  const hasEntries = entries && entries.length > 0;
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Auto-open when entries are added (client-side only to avoid hydration issues)
  useEffect(() => {
    if (hasEntries && !defaultOpen) {
      // eslint-disable-next-line -- Intentional: open collapsible when entries are added for better UX
      setIsOpen(true);
    }
  }, [hasEntries, defaultOpen]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card
        className={cn(
          'transition-colors',
          isLightMode ? 'bg-white border-zinc-200' : 'bg-zinc-900/50 border-zinc-800'
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <button
                className={cn(
                  'flex items-center gap-2 transition-colors text-left',
                  isLightMode ? 'hover:text-zinc-900' : 'hover:text-white'
                )}
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    isOpen && 'rotate-180',
                    isLightMode ? 'text-zinc-400' : 'text-zinc-500'
                  )}
                />
                <CardTitle
                  className={cn(
                    'text-base font-medium',
                    isLightMode ? 'text-zinc-800' : 'text-zinc-200'
                  )}
                >
                  {label}
                  {hasEntries && (
                    <span
                      className={cn(
                        'ml-2 text-xs font-normal',
                        isLightMode ? 'text-zinc-400' : 'text-zinc-500'
                      )}
                    >
                      ({entries.length})
                    </span>
                  )}
                </CardTitle>
              </button>
            </CollapsibleTrigger>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
                setIsOpen(true);
              }}
              className={cn(
                'h-7 text-xs',
                isLightMode
                  ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
        </CardHeader>
        <CollapsibleContent>
          {hasEntries && (
            <CardContent className="space-y-3 pt-0">
              {entries.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    'rounded-lg p-3 space-y-2 transition-colors',
                    isLightMode
                      ? 'bg-zinc-50 border border-zinc-200'
                      : 'bg-zinc-800/30 border border-zinc-700/50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Input
                      value={item.name}
                      onChange={(e) => onUpdate(index, 'name', e.target.value)}
                      placeholder="Name"
                      className={cn(
                        'flex-1 h-8 text-sm',
                        getInputWithPlaceholderClassName(isLightMode)
                      )}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(index)}
                      className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Textarea
                    value={item.description}
                    onChange={(e) => onUpdate(index, 'description', e.target.value)}
                    placeholder="Description"
                    rows={2}
                    className={cn(
                      'text-sm resize-none',
                      getInputWithPlaceholderClassName(isLightMode)
                    )}
                  />
                </div>
              ))}
            </CardContent>
          )}
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
