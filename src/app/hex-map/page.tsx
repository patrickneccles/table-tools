'use client';

import { ErrorBoundary } from '@/components/error-boundary';
import { HexMapCanvas } from '@/components/hex-map';
import { ToolPageHeader } from '@/components/layout/tool-page-header';
import { KeyboardShortcutsHelp } from '@/components/ui/keyboard-shortcuts-help';
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
      >
        <KeyboardShortcutsHelp
          groups={[
            {
              label: 'History',
              shortcuts: [
                { keys: '⌘Z', description: 'Undo' },
                { keys: '⇧⌘Z', description: 'Redo' },
              ],
            },
            {
              label: 'File',
              shortcuts: [
                { keys: '⌘E', description: 'Export' },
                { keys: '⌘I', description: 'Import' },
                { keys: '⌘N', description: 'Clear' },
              ],
            },
            {
              label: 'View',
              shortcuts: [
                { keys: '⌘+', description: 'Zoom in' },
                { keys: '⌘−', description: 'Zoom out' },
                { keys: '⌘0', description: 'Reset zoom' },
              ],
            },
          ]}
        />
      </ToolPageHeader>

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
