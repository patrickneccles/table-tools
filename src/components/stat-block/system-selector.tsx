/**
 * System Selector Component
 * 
 * Allows users to choose between different stat block systems/editions.
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { getAllSystemMetadata } from "./systems";

export type SystemSelectorProps = {
  currentSystemId: string;
  onSystemChange: (systemId: string) => void;
  isLightMode?: boolean;
};

export function SystemSelector({
  currentSystemId,
  onSystemChange,
  isLightMode = false,
}: SystemSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [pendingSystemId, setPendingSystemId] = React.useState<string | null>(null);
  const systems = getAllSystemMetadata();
  const currentSystem = systems.find(s => s.id === currentSystemId);
  const pendingSystem = systems.find(s => s.id === pendingSystemId);

  const handleSystemSelect = (systemId: string) => {
    if (systemId === currentSystemId) {
      setOpen(false);
      return;
    }
    setPendingSystemId(systemId);
    setOpen(false);
    setAlertOpen(true);
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
            aria-label="Select stat block system"
            variant="outline"
            size="sm"
            className={cn(
              isLightMode
                ? "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800"
                : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <BookOpen className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {currentSystem?.name || "Select System"}
            </span>
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
            <h3 className={cn(
              "font-medium text-sm",
              isLightMode ? "text-zinc-800" : "text-white"
            )}>Choose Stat Block System</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Select which TTRPG system or edition to use
            </p>
          </div>
          <Separator />
          <div className="p-2">
            {systems.map((system) => {
              const isSelected = system.id === currentSystemId;
              return (
                <Button
                  key={system.id}
                  variant="ghost"
                  onClick={() => handleSystemSelect(system.id)}
                  className={cn(
                    "w-full justify-start h-auto py-2 px-3",
                    isSelected && "bg-accent"
                  )}
                >
                  <div className="flex flex-col items-start gap-1 w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{system.name}</span>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <div className="text-xs text-muted-foreground font-normal">
                      {system.description} • v{system.version}
                    </div>
                  </div>
                </Button>
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
              Switch System?
            </AlertDialogTitle>
            <AlertDialogDescription className={cn(
              isLightMode ? "text-zinc-600" : "text-zinc-400"
            )}>
              {pendingSystem && (
                <>
                  <span className="block mb-2">
                    Your current stat block data may not be fully compatible with the new system format.
                    Some fields may not display correctly or may be lost.
                  </span>
                  <span className="block font-medium">
                    Are you sure you want to continue?
                  </span>
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
