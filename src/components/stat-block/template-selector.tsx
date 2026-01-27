/**
 * Template Selector Component
 * 
 * Allows users to select pre-built creature templates or reset to default.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatBlockTemplate } from "./stat-block-utils";
import { STAT_BLOCK_TEMPLATES } from "./templates";

type TemplateSelectorProps = {
  onSelect: (template: StatBlockTemplate) => void;
  onReset: () => void;
  currentSystemId: string;
  isLightMode: boolean;
};

export function TemplateSelector({ 
  onSelect, 
  onReset,
  currentSystemId, 
  isLightMode 
}: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);

  // Filter templates to only show ones for the current system
  const filteredTemplates = STAT_BLOCK_TEMPLATES.filter(
    template => template.systemId === currentSystemId
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            isLightMode
              ? "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800"
              : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          )}
        >
          <FileText className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Templates</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-80 p-0",
          isLightMode
            ? "bg-white border-zinc-200"
            : "bg-zinc-900 border-zinc-700"
        )}
        align="start"
      >
        <div className={cn(
          "p-3 border-b",
          isLightMode ? "border-zinc-200" : "border-zinc-800"
        )}>
          <div className="flex items-center justify-between">
            <h3 className={cn(
              "font-medium text-sm",
              isLightMode ? "text-zinc-800" : "text-white"
            )}>Choose a Template</h3>
            <button
              onClick={() => {
                onReset();
                setOpen(false);
              }}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                isLightMode 
                  ? "hover:bg-zinc-100 text-zinc-600 hover:text-zinc-800"
                  : "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              )}
              title="Reset to default"
              aria-label="Reset to default"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {filteredTemplates.length > 0 
              ? `${filteredTemplates.length} pre-built creature${filteredTemplates.length !== 1 ? 's' : ''} available`
              : "No templates available for this system"}
          </p>
        </div>
        <div className="p-2">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                onSelect(template);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-2 py-2 rounded-md transition-colors",
                isLightMode ? "hover:bg-zinc-100" : "hover:bg-zinc-800"
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium",
                  isLightMode ? "text-zinc-700" : "text-zinc-200"
                )}>{template.name}</span>
                {template.isSRD && (
                  <span className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                    isLightMode
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-emerald-900/50 text-emerald-400 border-emerald-800/50"
                  )}>
                    SRD
                  </span>
                )}
              </div>
              {template.description && (
                <p className="text-xs text-zinc-500 mt-0.5">{template.description}</p>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
