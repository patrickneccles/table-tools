'use client';

import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

// ============================================================================
// Shared Input Styles
// ============================================================================

export function getInputClassName(isLightMode: boolean): string {
  return cn(
    'transition-colors',
    isLightMode
      ? 'bg-white border-zinc-300 text-zinc-800 autofill:bg-white autofill:text-zinc-800'
      : 'bg-zinc-800/50 border-zinc-700 text-white autofill:bg-zinc-800/50 autofill:text-white'
  );
}

export function getInputWithPlaceholderClassName(isLightMode: boolean): string {
  return cn(
    getInputClassName(isLightMode),
    isLightMode ? 'placeholder:text-zinc-400' : 'placeholder:text-zinc-600'
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
      <Label
        htmlFor={id}
        className={cn('text-xs transition-colors', isLightMode ? 'text-zinc-600' : 'text-zinc-400')}
      >
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
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  isLightMode?: boolean;
};

export function TextInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  isLightMode = false,
}: TextInputProps) {
  return (
    <FormField id={id} label={label} className={className} isLightMode={isLightMode}>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={
          placeholder
            ? getInputWithPlaceholderClassName(isLightMode)
            : getInputClassName(isLightMode)
        }
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
  onBlur?: () => void;
  min?: number;
  max?: number;
  className?: string;
  isLightMode?: boolean;
};

export function NumberInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  min,
  max,
  className,
  isLightMode = false,
}: NumberInputProps) {
  return (
    <FormField id={id} label={label} className={className} isLightMode={isLightMode}>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value ?? ''}
        onChange={(e) => {
          const parsed = parseInt(e.target.value);
          onChange(isNaN(parsed) ? undefined : parsed);
        }}
        onBlur={onBlur}
        className={getInputClassName(isLightMode)}
      />
    </FormField>
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

export function EditorCard({
  title,
  children,
  defaultOpen = true,
  collapsible = true,
  isLightMode = false,
}: EditorCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!collapsible) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className={cn('text-base font-medium', isLightMode ? 'text-zinc-800' : 'text-zinc-200')}
          >
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardAction>
              <ChevronDown
                className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
              />
            </CardAction>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
