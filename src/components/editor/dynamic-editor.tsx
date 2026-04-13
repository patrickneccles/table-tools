/**
 * Dynamic Editor
 *
 * Renders editor fields dynamically based on a system's schema sections array.
 * Used by both stat blocks and spell blocks.
 */

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { EditorCard, TextInput, NumberInput, getInputClassName } from './editor-primitives';
import type {
  SectionDefinition,
  FieldDefinition,
} from '@/components/stat-block/systems/base-system';
import type { BaseStatBlockData } from '@/components/stat-block/stat-block-utils';

type DynamicEditorProps<T extends BaseStatBlockData> = {
  data: T;
  sections: SectionDefinition[];
  onFieldChange: (path: string, value: unknown) => void;
  onBlur?: () => void;
  isLightMode: boolean;
};

// Helper to get nested value from object using dot notation
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current !== null && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function FieldHelp({ helpText, isLightMode }: { helpText?: string; isLightMode: boolean }) {
  if (!helpText) return null;
  return (
    <p className={cn('text-[10px] mt-1', isLightMode ? 'text-zinc-500' : 'text-zinc-600')}>
      {helpText}
    </p>
  );
}

function DynamicField<T extends BaseStatBlockData>({
  field,
  data,
  onFieldChange,
  onBlur,
  isLightMode,
}: {
  field: FieldDefinition;
  data: T;
  onFieldChange: (path: string, value: unknown) => void;
  onBlur?: () => void;
  isLightMode: boolean;
}) {
  const value = getNestedValue(data, field.key);

  switch (field.type) {
    case 'text':
      return (
        <div>
          <TextInput
            id={field.key}
            label={field.label}
            value={typeof value === 'string' ? value : String(value ?? '')}
            onChange={(v) => onFieldChange(field.key, v)}
            onBlur={onBlur}
            placeholder={field.placeholder}
            isLightMode={isLightMode}
          />
          <FieldHelp helpText={field.helpText} isLightMode={isLightMode} />
        </div>
      );

    case 'textarea': {
      // Handle array values by converting to/from newline-separated strings
      const isArray = Array.isArray(value);
      const displayValue = isArray
        ? value.join('\n')
        : typeof value === 'string'
          ? value
          : String(value ?? '');

      return (
        <div>
          <Label
            htmlFor={field.key}
            className={cn(
              'text-xs transition-colors',
              isLightMode ? 'text-zinc-600' : 'text-zinc-400'
            )}
          >
            {field.label}
          </Label>
          <Textarea
            id={field.key}
            value={displayValue}
            onChange={(e) => {
              const newValue = e.target.value;
              // If original was array, convert back to array, otherwise keep as string
              const finalValue = isArray
                ? newValue.split('\n').filter((line) => line.trim() !== '')
                : newValue;
              onFieldChange(field.key, finalValue);
            }}
            onBlur={onBlur}
            placeholder={field.placeholder}
            rows={3}
            className={cn(getInputClassName(isLightMode), 'resize-none')}
          />
          <FieldHelp helpText={field.helpText} isLightMode={isLightMode} />
        </div>
      );
    }

    case 'markdown': {
      // Backward-compat: old localStorage data may have TraitEntry[] arrays
      let markdownValue: string;
      if (Array.isArray(value)) {
        markdownValue = (value as Array<{ name?: string; description?: string }>)
          .map((entry) => `**${entry.name ?? ''}.** ${entry.description ?? ''}`)
          .join('\n\n');
      } else {
        markdownValue = typeof value === 'string' ? value : String(value ?? '');
      }
      return (
        <MarkdownEditor
          id={field.key}
          label={field.label}
          value={markdownValue}
          onChange={(v) => onFieldChange(field.key, v)}
          onBlur={onBlur}
          placeholder={field.placeholder}
          isLightMode={isLightMode}
          insertTemplates={field.insertTemplates}
        />
      );
    }

    case 'number':
      return (
        <div>
          <NumberInput
            id={field.key}
            label={field.label}
            value={
              typeof value === 'number' ? value : typeof value === 'string' ? Number(value) || 0 : 0
            }
            onChange={(v) => onFieldChange(field.key, v ?? 0)}
            isLightMode={isLightMode}
          />
          <FieldHelp helpText={field.helpText} isLightMode={isLightMode} />
        </div>
      );

    case 'checkbox':
      return (
        <div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={field.key}
              checked={typeof value === 'boolean' ? value : Boolean(value)}
              onChange={(e) => onFieldChange(field.key, e.target.checked)}
              className={cn(
                'w-4 h-4 rounded transition-colors',
                isLightMode
                  ? 'border-zinc-300 text-amber-600 focus:ring-amber-500'
                  : 'border-zinc-700 text-amber-600 focus:ring-amber-500'
              )}
            />
            <Label
              htmlFor={field.key}
              className={cn(
                'text-xs transition-colors cursor-pointer',
                isLightMode ? 'text-zinc-600' : 'text-zinc-400'
              )}
            >
              {field.label}
            </Label>
          </div>
          <FieldHelp helpText={field.helpText} isLightMode={isLightMode} />
        </div>
      );

    case 'select': {
      // shadcn Select forbids empty-string values; use a sentinel for the "none" option
      const NONE = '__none__';
      const raw = typeof value === 'string' ? value : String(value ?? '');
      const selectValue = raw === '' ? NONE : raw;
      return (
        <div>
          <Label
            className={cn(
              'text-xs transition-colors',
              isLightMode ? 'text-zinc-600' : 'text-zinc-400'
            )}
          >
            {field.label}
          </Label>
          <Select
            value={selectValue}
            onValueChange={(v) => onFieldChange(field.key, v === NONE ? '' : v)}
          >
            <SelectTrigger className={cn('mt-1', getInputClassName(isLightMode))}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value || NONE} value={option.value || NONE}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldHelp helpText={field.helpText} isLightMode={isLightMode} />
        </div>
      );
    }

    default:
      return null;
  }
}

export function DynamicEditor<T extends BaseStatBlockData>({
  data,
  sections,
  onFieldChange,
  onBlur,
  isLightMode,
}: DynamicEditorProps<T>) {
  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <EditorCard
          key={section.key}
          title={section.title}
          isLightMode={isLightMode}
          defaultOpen={!section.defaultCollapsed}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {section.fields.map((field) => (
              <div
                key={field.key}
                className={cn(
                  // Full width for textarea and certain fields
                  field.type === 'textarea' ||
                    field.type === 'markdown' ||
                    field.key === 'name' ||
                    field.key === 'description'
                    ? 'col-span-2'
                    : 'col-span-1'
                )}
              >
                <DynamicField
                  field={field}
                  data={data}
                  onFieldChange={onFieldChange}
                  onBlur={onBlur}
                  isLightMode={isLightMode}
                />
              </div>
            ))}
          </div>
        </EditorCard>
      ))}
    </div>
  );
}
