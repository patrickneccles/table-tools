"use client";

import Link from "next/link";
import { ErrorBoundary } from "@/components/error-boundary";
import { HexMapCanvas } from "@/components/hex-map";
import { Button } from "@/components/ui/button";
import { useIsLightMode } from "@/hooks/use-is-light-mode";
import { cn } from "@/lib/utils";
import { Hexagon, Home } from "lucide-react";

export default function HexMapPage() {
  const isLightMode = useIsLightMode();

  return (
    <div
      className={cn(
        "flex min-h-[calc(100vh-4rem)] flex-col",
        isLightMode ? "bg-[#f5f5f7]" : "bg-[#0a0a0b]"
      )}
    >
      <header
        className={cn(
          "shrink-0 border-b backdrop-blur-sm",
          isLightMode
            ? "border-zinc-200 bg-white/80"
            : "border-zinc-800 bg-zinc-900/80"
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "rounded-lg p-2",
                isLightMode
                  ? "bg-violet-100 text-violet-600"
                  : "bg-violet-900/20 text-violet-400"
              )}
            >
              <Hexagon className="h-5 w-5" />
            </div>
            <div>
              <h1
                className={cn(
                  "text-xl font-bold transition-colors",
                  isLightMode ? "text-zinc-800" : "text-white"
                )}
              >
                Hex map
              </h1>
              <p className="text-sm text-zinc-500">
                Paint hexes, stamps, flood-fill, and JSON export
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={cn(
              "rounded-full text-xs",
              isLightMode
                ? "border border-zinc-900/10 bg-zinc-900/10 text-zinc-600 hover:bg-zinc-900/20 hover:text-zinc-800"
                : "border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
            )}
          >
            <Link href="/">
              <Home className="h-3 w-3" />
              <span className="ml-1 hidden sm:inline">Home</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col p-4">
        <div className="min-h-[min(70vh,800px)] flex-1">
          <ErrorBoundary>
            <HexMapCanvas />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
