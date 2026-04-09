'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileText, RotateCcw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StatBlockTemplate } from '@/components/stat-block/stat-block-utils';
import { SPELL_BLOCK_TEMPLATES } from './templates';

type SpellTemplateSelectorProps = {
  onSelect: (template: StatBlockTemplate) => void;
  onReset: () => void;
  currentSystemId: string;
  currentSystemName?: string;
  isLightMode: boolean;
};

export function SpellTemplateSelector({
  onSelect,
  onReset,
  currentSystemId,
  currentSystemName,
  isLightMode,
}: SpellTemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<StatBlockTemplate | null>(null);

  const filteredTemplates = SPELL_BLOCK_TEMPLATES.filter((t) => t.systemId === currentSystemId);

  const handleTemplateClick = (template: StatBlockTemplate) => {
    setPendingTemplate(template);
    setOpen(false);
    setTimeout(() => setAlertOpen(true), 0);
  };

  const handleConfirmSelect = () => {
    if (pendingTemplate) {
      onSelect(pendingTemplate);
      setPendingTemplate(null);
    }
    setAlertOpen(false);
  };

  const handleCancelSelect = () => {
    setPendingTemplate(null);
    setAlertOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              isLightMode
                ? 'border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800'
                : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white'
            )}
          >
            <FileText className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Templates</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            'w-72 p-0',
            isLightMode ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-700'
          )}
          align="end"
        >
          <div className="p-3">
            <div className="flex items-center justify-between">
              <h3
                className={cn('font-medium text-sm', isLightMode ? 'text-zinc-800' : 'text-white')}
              >
                Choose a Template
              </h3>
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
                ? `${filteredTemplates.length} pre-built ${currentSystemName ? `${currentSystemName} ` : ''}spell${filteredTemplates.length !== 1 ? 's' : ''}`
                : 'No templates available for this system'}
            </p>
          </div>
          <Separator />
          <div className="p-2">
            {filteredTemplates.map((template) => (
              <Button
                key={template.id}
                variant="ghost"
                onClick={() => handleTemplateClick(template)}
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
                    <p className="text-xs text-muted-foreground font-normal">
                      {template.description}
                    </p>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent
          className={cn(isLightMode ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-700')}
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              className={cn(
                'flex items-center gap-2',
                isLightMode ? 'text-zinc-800' : 'text-white'
              )}
            >
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Load Template?
            </AlertDialogTitle>
            <AlertDialogDescription className={cn(isLightMode ? 'text-zinc-600' : 'text-zinc-400')}>
              {pendingTemplate && (
                <>
                  <span className="block mb-2">
                    Selecting &quot;{pendingTemplate.name}&quot; will overwrite your current spell
                    block. Any unsaved changes will be lost.
                  </span>
                  <span className="block font-medium">Are you sure you want to continue?</span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelSelect}
              className={cn(
                isLightMode
                  ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              )}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSelect}
              className="bg-blue-600 text-white hover:bg-blue-500"
            >
              Load Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
