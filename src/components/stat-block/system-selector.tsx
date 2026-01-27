/**
 * System Selector Component
 * 
 * Allows users to choose between different stat block systems/editions.
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, BookOpen, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllSystemMetadata, canTransform } from "./systems";

export type SystemSelectorProps = {
  currentSystemId: string;
  onSystemChange: (systemId: string) => void;
  isLightMode?: boolean;
  /** Optional: source system for showing transformation availability */
  sourceSystemId?: string;
};

export function SystemSelector({ 
  currentSystemId, 
  onSystemChange, 
  isLightMode = false,
  sourceSystemId,
}: SystemSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [pendingSystemId, setPendingSystemId] = React.useState<string | null>(null);
  const systems = getAllSystemMetadata();
  const currentSystem = systems.find(s => s.id === currentSystemId);
  const pendingSystem = systems.find(s => s.id === pendingSystemId);

  const handleSystemSelect = (systemId: string) => {
    // Check if transformation is available
    const canConvert = sourceSystemId 
      ? canTransform(sourceSystemId, systemId) 
      : true;

    if (!canConvert && systemId !== currentSystemId) {
      // Show confirmation dialog
      setPendingSystemId(systemId);
      setOpen(false);
      setAlertOpen(true);
    } else {
      // Direct switch
      onSystemChange(systemId);
      setOpen(false);
    }
  };

  const handleConfirmSwitch = () => {
    if (pendingSystemId) {
      onSystemChange(pendingSystemId);
      setPendingSystemId(null);
    }
    setAlertOpen(false);
  };

  const handleCancelSwitch = () => {
    setPendingSystemId(null);
    setAlertOpen(false);
  };

  return (
    <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "gap-2",
            isLightMode
              ? "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800"
              : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          )}
        >
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentSystem?.name || "Select System"}
          </span>
          <span className="sm:hidden">System</span>
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
          <h3 className={cn(
            "font-medium text-sm",
            isLightMode ? "text-zinc-800" : "text-white"
          )}>Choose Stat Block System</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Select which TTRPG system or edition to use
          </p>
        </div>
        <div className="p-2">
          {systems.map((system) => {
            const isSelected = system.id === currentSystemId;
            const canConvert = sourceSystemId 
              ? canTransform(sourceSystemId, system.id) 
              : true;

            return (
              <button
                key={system.id}
                onClick={() => handleSystemSelect(system.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md transition-colors flex items-start gap-2",
                  isSelected 
                    ? isLightMode 
                      ? "bg-amber-100 text-amber-900"
                      : "bg-amber-900/30 text-amber-300"
                    : isLightMode 
                      ? "hover:bg-zinc-100 text-zinc-700"
                      : "hover:bg-zinc-800 text-zinc-200"
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{system.name}</span>
                    {isSelected && <Check className="h-3 w-3" />}
                    {!canConvert && !isSelected && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {system.description} • v{system.version}
                  </div>
                  {!canConvert && !isSelected && (
                    <div className="text-[10px] text-amber-600 mt-1">
                      ⚠️ No automatic conversion
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>

      {/* Confirmation Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className={cn(
          isLightMode
            ? "bg-white border-zinc-200"
            : "bg-zinc-900 border-zinc-700"
        )}>
          <AlertDialogHeader>
            <AlertDialogTitle className={cn(
              "flex items-center gap-2",
              isLightMode ? "text-zinc-800" : "text-white"
            )}>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Switch System Without Conversion?
            </AlertDialogTitle>
            <AlertDialogDescription className={cn(
              isLightMode ? "text-zinc-600" : "text-zinc-400"
            )}>
              {pendingSystem && (
                <>
                  <p className="mb-2">
                    You're switching from <strong>{currentSystem?.name}</strong> to{" "}
                    <strong>{pendingSystem.name}</strong>, but automatic conversion is not available.
                  </p>
                  <p className="mb-2">
                    Your current stat block data may not be fully compatible with the new system format.
                    Some fields may not display correctly or may be lost.
                  </p>
                  <p className="font-medium">
                    Are you sure you want to continue?
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={handleCancelSwitch}
              className={cn(
                isLightMode
                  ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              )}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSwitch}
              className="bg-amber-600 text-white hover:bg-amber-500"
            >
              Switch Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
