"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Dynamically import BoardBuilder with SSR disabled to prevent hydration errors
// @dnd-kit generates different aria-describedby IDs on server vs client
const BoardBuilder = dynamic(
  () => import("@/components/mood-board/builder").then((mod) => mod.BoardBuilder),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm">Loading builder...</span>
        </div>
      </div>
    ),
  }
);

export default function BuilderPage() {
  const [isLightMode, setIsLightMode] = useState(false);

  // Check for existing light mode preference on mount
  useEffect(() => {
    const isLight = document.documentElement.classList.contains("light");
    setIsLightMode(isLight);
  }, []);

  const toggleTheme = () => {
    const newIsLight = !isLightMode;
    setIsLightMode(newIsLight);
    document.documentElement.classList.toggle("light", newIsLight);
  };

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        isLightMode ? "bg-[#f0f0f2]" : "bg-[#0a0a0b]"
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                isLightMode
                  ? "text-zinc-600 hover:text-zinc-800 hover:bg-zinc-200"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              )}
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <div>
              <h1
                className={cn(
                  "text-2xl font-bold tracking-tight",
                  isLightMode ? "text-zinc-800" : "text-white"
                )}
              >
                Mood Board Builder
              </h1>
              <p
                className={cn(
                  "text-sm",
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                )}
              >
                Create and customize your own soundboard
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={cn(
              "rounded-full text-xs",
              isLightMode
                ? "bg-zinc-900/10 border border-zinc-900/10 text-zinc-600 hover:bg-zinc-900/20 hover:text-zinc-800"
                : "bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
            )}
          >
            {isLightMode ? "Dark" : "Light"}
          </Button>
        </div>

        {/* Builder */}
        <div className="min-h-[calc(100vh-12rem)]">
          <BoardBuilder
            isLightMode={isLightMode}
            onSave={(config) => {
              // In a real app, this would save to a database
              console.log("Saving board config:", config);
              // Could also save to localStorage for persistence
              localStorage.setItem(`moodboard-${config.id}`, JSON.stringify(config));
            }}
          />
        </div>
      </div>
    </div>
  );
}
