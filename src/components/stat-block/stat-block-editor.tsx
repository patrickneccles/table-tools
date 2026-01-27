"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TraitEntry, TraitSectionKey } from "./types";
import { TRAIT_SECTION_LABELS } from "./types";

// ============================================================================
// Shared Input Styles
// ============================================================================

export function getInputClassName(isLightMode: boolean): string {
  return cn(
    "transition-colors",
    isLightMode
      ? "bg-white border-zinc-300 text-zinc-800"
      : "bg-zinc-800/50 border-zinc-700 text-white"
  );
}

export function getInputWithPlaceholderClassName(isLightMode: boolean): string {
  return cn(
    getInputClassName(isLightMode),
    isLightMode ? "placeholder:text-zinc-400" : "placeholder:text-zinc-600"
  );
}

// ============================================================================
// FormField Component
// ============================================================================

type FormFieldProps = {
  id: string;
  label: string;
  children: React.ReactNode;
  className?: string;
  isLightMode?: boolean;
};

export function FormField({ id, label, children, className, isLightMode = false }: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={id} className={cn(
        "text-xs transition-colors",
        isLightMode ? "text-zinc-600" : "text-zinc-400"
      )}>
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
  isLightMode?: boolean;
};

export function TextInput({ id, label, value, onChange, placeholder, className, isLightMode = false }: TextInputProps) {
  return (
    <FormField id={id} label={label} className={className} isLightMode={isLightMode}>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={placeholder ? getInputWithPlaceholderClassName(isLightMode) : getInputClassName(isLightMode)}
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
  isLightMode?: boolean;
};

export function NumberInput({ id, label, value, onChange, min, max, className, isLightMode = false }: NumberInputProps) {
  return (
    <FormField id={id} label={label} className={className} isLightMode={isLightMode}>
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
        className={getInputClassName(isLightMode)}
      />
    </FormField>
  );
}

// ============================================================================
// TraitEditor Component - Collapsible trait/action section editor
// ============================================================================

type TraitEditorProps = {
  section: TraitSectionKey;
  entries: TraitEntry[] | undefined;
  onAdd: () => void;
  onUpdate: (index: number, field: "name" | "description", value: string) => void;
  onRemove: (index: number) => void;
  defaultOpen?: boolean;
  isLightMode?: boolean;
};

export function TraitEditor({ section, entries, onAdd, onUpdate, onRemove, defaultOpen = false, isLightMode = false }: TraitEditorProps) {
  const label = TRAIT_SECTION_LABELS[section];
  const hasEntries = entries && entries.length > 0;
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Auto-open when entries are added (client-side only to avoid hydration issues)
  useEffect(() => {
    if (hasEntries && !defaultOpen) {
      setIsOpen(true);
    }
  }, [hasEntries, defaultOpen]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn(
        "transition-colors",
        isLightMode ? "bg-white border-zinc-200" : "bg-zinc-900/50 border-zinc-800"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <button className={cn(
                "flex items-center gap-2 transition-colors text-left",
                isLightMode ? "hover:text-zinc-900" : "hover:text-white"
              )}>
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isOpen && "rotate-180",
                    isLightMode ? "text-zinc-400" : "text-zinc-500"
                  )} 
                />
                <CardTitle className={cn(
                  "text-base font-medium",
                  isLightMode ? "text-zinc-800" : "text-zinc-200"
                )}>
                  {label}
                  {hasEntries && (
                    <span className={cn(
                      "ml-2 text-xs font-normal",
                      isLightMode ? "text-zinc-400" : "text-zinc-500"
                    )}>
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
                "h-7 text-xs",
                isLightMode
                  ? "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
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
                    "rounded-lg p-3 space-y-2 transition-colors",
                    isLightMode
                      ? "bg-zinc-50 border border-zinc-200"
                      : "bg-zinc-800/30 border border-zinc-700/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Input
                      value={item.name}
                      onChange={(e) => onUpdate(index, "name", e.target.value)}
                      placeholder="Name"
                      className={cn(
                        "flex-1 h-8 text-sm",
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
                    onChange={(e) => onUpdate(index, "description", e.target.value)}
                    placeholder="Description"
                    rows={2}
                    className={cn(
                      "text-sm resize-none",
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

// ============================================================================
// EditorCard Component - Collapsible card wrapper for editor sections
// ============================================================================

type EditorCardProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
  isLightMode?: boolean;
};

export function EditorCard({ title, children, defaultOpen = true, collapsible = true, isLightMode = false }: EditorCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!collapsible) {
    return (
      <Card className={cn(
        "transition-colors",
        isLightMode ? "bg-white border-zinc-200" : "bg-zinc-900/50 border-zinc-800"
      )}>
        <CardHeader className="pb-3">
          <CardTitle className={cn(
            "text-base font-medium",
            isLightMode ? "text-zinc-800" : "text-zinc-200"
          )}>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn(
        "transition-colors",
        isLightMode ? "bg-white border-zinc-200" : "bg-zinc-900/50 border-zinc-800"
      )}>
        <CollapsibleTrigger asChild>
          <CardHeader className={cn(
            "pb-3 cursor-pointer transition-colors rounded-t-lg",
            isLightMode ? "hover:bg-zinc-50" : "hover:bg-zinc-800/30"
          )}>
            <div className="flex items-center justify-between">
              <CardTitle className={cn(
                "text-base font-medium",
                isLightMode ? "text-zinc-800" : "text-zinc-200"
              )}>{title}</CardTitle>
              <ChevronDown 
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-180",
                  isLightMode ? "text-zinc-400" : "text-zinc-500"
                )} 
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
