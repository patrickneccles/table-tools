/**
 * Dynamic Stat Block Editor
 * 
 * Renders editor fields dynamically based on the active system's schema.
 */

import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  EditorCard,
  TextInput,
  NumberInput,
  getInputClassName,
} from "./stat-block-editor";
import type { SectionDefinition, FieldDefinition } from "./systems/base-system";
import type { BaseStatBlockData } from "./stat-block-utils";

type DynamicEditorProps<T extends BaseStatBlockData> = {
  data: T;
  sections: SectionDefinition[];
  onFieldChange: (path: string, value: any) => void;
  onBlur?: () => void;
  isLightMode: boolean;
};

// Helper to get nested value from object using dot notation
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Helper to set nested value in object using dot notation
function setNestedValue(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
  return obj;
}

function FieldHelp({ helpText, isLightMode }: { helpText?: string; isLightMode: boolean }) {
  if (!helpText) return null;
  return (
    <p className={cn("text-[10px] mt-1", isLightMode ? "text-zinc-500" : "text-zinc-600")}>
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
  onFieldChange: (path: string, value: any) => void;
  onBlur?: () => void;
  isLightMode: boolean;
}) {
  const value = getNestedValue(data, field.key);

  switch (field.type) {
    case "text":
      return (
        <div>
          <TextInput
            id={field.key}
            label={field.label}
            value={value || ""}
            onChange={(v) => onFieldChange(field.key, v)}
            onBlur={onBlur}
            placeholder={field.placeholder}
            isLightMode={isLightMode}
          />
          <FieldHelp helpText={field.helpText} isLightMode={isLightMode} />
        </div>
      );

    case "textarea": {
      // Handle array values by converting to/from newline-separated strings
      const isArray = Array.isArray(value);
      const displayValue = isArray ? value.join('\n') : (value || "");
      
      return (
        <div>
          <Label
            htmlFor={field.key}
            className={cn(
              "text-xs transition-colors",
              isLightMode ? "text-zinc-600" : "text-zinc-400"
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
                ? newValue.split('\n').filter(line => line.trim() !== '')
                : newValue;
              onFieldChange(field.key, finalValue);
            }}
            onBlur={onBlur}
            placeholder={field.placeholder}
            rows={3}
            className={cn(
              getInputClassName(isLightMode),
              "resize-none"
            )}
          />
          <FieldHelp helpText={field.helpText} isLightMode={isLightMode} />
        </div>
      );
    }

    case "number":
      return (
        <div>
          <NumberInput
            id={field.key}
            label={field.label}
            value={value ?? 0}
            onChange={(v) => onFieldChange(field.key, v ?? 0)}
            isLightMode={isLightMode}
          />
          <FieldHelp helpText={field.helpText} isLightMode={isLightMode} />
        </div>
      );

    case "checkbox":
      return (
        <div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={field.key}
              checked={value || false}
              onChange={(e) => onFieldChange(field.key, e.target.checked)}
              className={cn(
                "w-4 h-4 rounded transition-colors",
                isLightMode
                  ? "border-zinc-300 text-amber-600 focus:ring-amber-500"
                  : "border-zinc-700 text-amber-600 focus:ring-amber-500"
              )}
            />
            <Label
              htmlFor={field.key}
              className={cn(
                "text-xs transition-colors cursor-pointer",
                isLightMode ? "text-zinc-600" : "text-zinc-400"
              )}
            >
              {field.label}
            </Label>
          </div>
          <FieldHelp helpText={field.helpText} isLightMode={isLightMode} />
        </div>
      );

    case "select":
      return (
        <div>
          <Label
            htmlFor={field.key}
            className={cn(
              "text-xs transition-colors",
              isLightMode ? "text-zinc-600" : "text-zinc-400"
            )}
          >
            {field.label}
          </Label>
          <select
            id={field.key}
            value={value || ""}
            onChange={(e) => onFieldChange(field.key, e.target.value)}
            className={getInputClassName(isLightMode)}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldHelp helpText={field.helpText} isLightMode={isLightMode} />
        </div>
      );

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
    <div className="space-y-4">
      {sections.map((section) => (
        <EditorCard
          key={section.key}
          title={section.title}
          isLightMode={isLightMode}
          defaultOpen={!section.defaultCollapsed}
        >
          <div className="grid grid-cols-2 gap-3">
            {section.fields.map((field) => (
              <div
                key={field.key}
                className={cn(
                  // Full width for textarea and certain fields
                  field.type === "textarea" || field.key === "name" || field.key === "description"
                    ? "col-span-2"
                    : "col-span-1"
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
