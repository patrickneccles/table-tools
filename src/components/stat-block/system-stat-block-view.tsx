/**
 * System-Aware Stat Block View
 * 
 * Renders a stat block using the appropriate system renderer.
 */

"use client";

import React from "react";
import { getSystem } from "./systems";

export type SystemStatBlockViewProps = {
  systemId: string;
  data: any;
  className?: string;
};

/**
 * Renders a stat block using the specified system's renderer
 */
export function SystemStatBlockView({ systemId, data, className }: SystemStatBlockViewProps) {
  const system = getSystem(systemId);
  
  if (!system) {
    return (
      <div className="bg-red-50 border-2 border-red-500 p-4 rounded-lg text-red-900">
        <p className="font-bold">Unknown System</p>
        <p className="text-sm">System "{systemId}" not found in registry.</p>
      </div>
    );
  }
  
  const Renderer = system.Renderer;
  
  return <Renderer data={data} className={className} />;
}
