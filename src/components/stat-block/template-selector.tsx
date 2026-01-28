/**
 * Template Selector Component
 * 
 * Allows users to select pre-built creature templates or reset to default.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatBlockTemplate } from "./stat-block-utils";
import { STAT_BLOCK_TEMPLATES } from "./templates";

type TemplateSelectorProps = {
  onSelect: (template: StatBlockTemplate) => void;
  onReset: () => void;
  currentSystemId: string;
  currentSystemName?: string;
  isLightMode: boolean;
};

export function TemplateSelector({
  onSelect,
  onReset,
  currentSystemId,
  currentSystemName,
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
        <div className="p-3">
          <div className="flex items-center justify-between">
            <h3 className={cn(
              "font-medium text-sm",
              isLightMode ? "text-zinc-800" : "text-white"
            )}>Choose a Template</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onReset();
                setOpen(false);
              }}
              className="h-7 w-7"
              title="Reset to default"
              aria-label="Reset to default"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {filteredTemplates.length > 0
              ? `${filteredTemplates.length} pre-built ${currentSystemName ? `${currentSystemName} ` : ''}creature${filteredTemplates.length !== 1 ? 's' : ''}`
              : "No templates available for this system"}
          </p>
        </div>
        <Separator />
        <div className="p-2">
          {filteredTemplates.map((template) => (
            <Button
              key={template.id}
              variant="ghost"
              onClick={() => {
                onSelect(template);
                setOpen(false);
              }}
              className="w-full justify-start h-auto py-2 px-2"
            >
              <div className="flex flex-col items-start gap-1 w-full">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{template.name}</span>
                  {template.isSRD && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                      SRD
                    </Badge>
                  )}
                </div>
                {template.description && (
                  <p className="text-xs text-muted-foreground font-normal">{template.description}</p>
                )}
              </div>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
