"use client";

import Link from "next/link";
import { useIsLightMode } from "@/hooks/use-is-light-mode";
import { cn } from "@/lib/utils";
import { Music, Scroll, Wrench, ArrowRight, Sparkles, Mail, Hexagon } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  isLightMode: boolean;
  badge?: string;
}

function ToolCard({ title, description, href, icon, color, isLightMode, badge }: ToolCardProps) {
  return (
    <Link href={href} className="group block">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl p-6 transition-all duration-300",
          "border hover:scale-[1.02] hover:shadow-2xl",
          isLightMode
            ? "bg-white border-zinc-200 shadow-sm hover:border-zinc-300"
            : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
        )}
        style={{
          boxShadow: `0 0 0 0 ${color}00`,
        }}
      >
        {/* Gradient accent */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${color}15 0%, transparent 70%)`,
          }}
        />

        {/* Badge */}
        {badge && (
          <div
            className={cn(
              "absolute top-4 right-4 text-[10px] font-medium px-2 py-1 rounded-full",
              isLightMode
                ? "bg-zinc-100 text-zinc-600"
                : "bg-zinc-800 text-zinc-400"
            )}
          >
            {badge}
          </div>
        )}

        {/* Content */}
        <div className="relative">
          <div
            className="inline-flex p-3 rounded-xl mb-4"
            style={{
              background: `${color}20`,
              color: color,
            }}
          >
            {icon}
          </div>

          <h2
            className={cn(
              "text-xl font-semibold mb-2 transition-colors",
              isLightMode ? "text-zinc-800" : "text-white"
            )}
          >
            {title}
          </h2>

          <p
            className={cn(
              "text-sm mb-4",
              isLightMode ? "text-zinc-500" : "text-zinc-400"
            )}
          >
            {description}
          </p>

          <div
            className={cn(
              "inline-flex items-center gap-1 text-sm font-medium transition-colors",
              "group-hover:gap-2"
            )}
            style={{ color }}
          >
            Open tool
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const isLightMode = useIsLightMode();

  const tools = [
    {
      title: "Mood Board",
      description:
        "Virtual soundboard for immersive audio experiences. Perfect for TTRPGs, podcasts, and streaming.",
      href: "/mood-board",
      icon: <Music className="h-6 w-6" />,
      color: "#22c55e",
      badge: "Audio",
    },
    {
      title: "Stat Block Generator",
      description:
        "Create and print D&D 5e stat blocks. Includes SRD templates with auto-calculations.",
      href: "/stat-blocks",
      icon: <Scroll className="h-6 w-6" />,
      color: "#f59e0b",
      badge: "Print",
    },
    {
      title: "Hex map",
      description:
        "Draw overland or battle hex grids with colors, Lucide stamps, and JSON export.",
      href: "/hex-map",
      icon: <Hexagon className="h-6 w-6" />,
      color: "#8b5cf6",
      badge: "Maps",
    },
  ];

  return (
    <div
      className={cn(
        "min-h-full transition-colors duration-300",
        isLightMode ? "bg-[#f5f5f7]" : "bg-[#0a0a0b]"
      )}
    >
      {/* Subtle gradient background */}
      <div
        className={cn(
          "fixed inset-0 pointer-events-none",
          isLightMode ? "opacity-30" : "opacity-50"
        )}
        style={{
          background: `
            radial-gradient(ellipse at 20% 0%, #22c55e10 0%, transparent 50%),
            radial-gradient(ellipse at 80% 0%, #f59e0b10 0%, transparent 50%)
          `,
        }}
      />

      <div className="relative container mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-center mb-16">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-xl",
                isLightMode ? "bg-zinc-900/5" : "bg-white/5"
              )}
            >
              <Sparkles
                className={cn(
                  "h-6 w-6",
                  isLightMode ? "text-zinc-700" : "text-zinc-300"
                )}
              />
            </div>
            <span
              className={cn(
                "font-semibold text-lg",
                isLightMode ? "text-zinc-800" : "text-white"
              )}
            >
              Moodie
            </span>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-16">
          <h1
            className={cn(
              "text-4xl sm:text-5xl font-bold tracking-tight mb-4",
              isLightMode ? "text-zinc-800" : "text-white"
            )}
          >
            Creative Tools for
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-amber-500 bg-clip-text text-transparent">
              Tabletop Gaming
            </span>
          </h1>
          <p
            className={cn(
              "text-lg max-w-xl mx-auto",
              isLightMode ? "text-zinc-500" : "text-zinc-400"
            )}
          >
            A collection of tools to enhance your TTRPG sessions, streaming, and creative projects.
          </p>
        </div>

        {/* Tool Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          {tools.map((tool) => (
            <ToolCard key={tool.href} {...tool} isLightMode={isLightMode} />
          ))}
        </div>

        {/* Coming Soon / Builder teaser */}
        <div
          className={cn(
            "rounded-2xl p-6 text-center border flex flex-col items-center gap-4",
            isLightMode
              ? "bg-white/50 border-zinc-200"
              : "bg-zinc-900/30 border-zinc-800"
          )}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wrench
              className={cn(
                "h-4 w-4",
                isLightMode ? "text-zinc-400" : "text-zinc-500"
              )}
            />
            <span
              className={cn(
                "text-sm font-medium",
                isLightMode ? "text-zinc-600" : "text-zinc-400"
              )}
            >
              More tools coming soon
            </span>
          </div>
          <p
            className={cn(
              "text-xs",
              isLightMode ? "text-zinc-400" : "text-zinc-500"
            )}
          >
            Reach out with requests or suggestions!
          </p>
          <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><a className="text-sm" href="mailto:patrick@penpyre.com">patrick@penpyre.com</a></div>
        </div>

      </div>
    </div>
  );
}
