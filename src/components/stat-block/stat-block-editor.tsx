"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { TraitEntry, TraitSectionKey } from "./types";
import { TRAIT_SECTION_LABELS } from "./types";

// ============================================================================
// Shared Input Styles
// ============================================================================

const inputClassName = "bg-zinc-800/50 border-zinc-700 text-white";
const inputWithPlaceholderClassName = `${inputClassName} placeholder:text-zinc-600`;

// ============================================================================
// FormField Component
// ============================================================================

type FormFieldProps = {
  id: string;
  label: string;
  children: React.ReactNode;
  className?: string;
};

export function FormField({ id, label, children, className }: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="text-zinc-400 text-xs">
        {label}
      </Label>
      {children}
    </div>
  );
}

// ============================================================================
// TextInput Component - Consistent styled text input
// ============================================================================

type TextInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function TextInput({ id, label, value, onChange, placeholder, className }: TextInputProps) {
  return (
    <FormField id={id} label={label} className={className}>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={placeholder ? inputWithPlaceholderClassName : inputClassName}
      />
    </FormField>
  );
}

// ============================================================================
// NumberInput Component - Consistent styled number input
// ============================================================================

type NumberInputProps = {
  id: string;
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  className?: string;
};

export function NumberInput({ id, label, value, onChange, min, max, className }: NumberInputProps) {
  return (
    <FormField id={id} label={label} className={className}>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value ?? ""}
        onChange={(e) => {
          const parsed = parseInt(e.target.value);
          onChange(isNaN(parsed) ? undefined : parsed);
        }}
        className={inputClassName}
      />
    </FormField>
  );
}

// ============================================================================
// TraitEditor Component
// ============================================================================

type TraitEditorProps = {
  section: TraitSectionKey;
  entries: TraitEntry[] | undefined;
  onAdd: () => void;
  onUpdate: (index: number, field: "name" | "description", value: string) => void;
  onRemove: (index: number) => void;
};

export function TraitEditor({ section, entries, onAdd, onUpdate, onRemove }: TraitEditorProps) {
  const label = TRAIT_SECTION_LABELS[section];
  const hasEntries = entries && entries.length > 0;

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-zinc-200">
            {label}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAdd}
            className="h-7 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
      </CardHeader>
      {hasEntries && (
        <CardContent className="space-y-3 pt-0">
          {entries.map((item, index) => (
            <div
              key={index}
              className="rounded-lg bg-zinc-800/30 border border-zinc-700/50 p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={item.name}
                  onChange={(e) => onUpdate(index, "name", e.target.value)}
                  placeholder="Name"
                  className="flex-1 h-8 bg-zinc-800/50 border-zinc-700 text-white text-sm"
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
                onChange={(e) => onUpdate(index, "description", e.target.value)}
                placeholder="Description"
                rows={2}
                className="bg-zinc-800/50 border-zinc-700 text-white text-sm resize-none"
              />
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

// ============================================================================
// EditorCard Component - Consistent card wrapper for editor sections
// ============================================================================

type EditorCardProps = {
  title: string;
  children: React.ReactNode;
};

export function EditorCard({ title, children }: EditorCardProps) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-zinc-200">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
