'use client';

import { ErrorBoundary } from '@/components/error-boundary';
import { HexMapCanvas } from '@/components/hex-map';
import { ToolPageHeader } from '@/components/layout/tool-page-header';
import { useIsLightMode } from '@/hooks/use-is-light-mode';
import { cn } from '@/lib/utils';
import { Hexagon } from 'lucide-react';

export default function HexMapPage() {
  const isLightMode = useIsLightMode();

  return (
    <div
      className={cn(
        'flex min-h-[calc(100vh-4rem)] flex-col',
        isLightMode ? 'bg-[#f5f5f7]' : 'bg-[#0a0a0b]'
      )}
    >
      <ToolPageHeader
        heading="Hex Map"
        subtitle="Paint hexes, stamps, flood-fill, and JSON export"
        icon={<Hexagon className="h-5 w-5" />}
        iconColor="#8b5cf6"
        maxWidth="max-w-6xl"
      />

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
