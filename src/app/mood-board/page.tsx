'use client';

import { useState, useMemo } from 'react';
import { MoodBoard, Mood, boardTemplates, BoardTemplate } from '@/components/mood-board';
import { useIsLightMode } from '@/hooks/use-is-light-mode';
import { isToolEnabled } from '@/lib/feature-flags';
import { WipPage } from '@/components/wip-page';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Wrench, Loader2, Music } from 'lucide-react';
import { ToolPageHeader } from '@/components/layout/tool-page-header';
import { useAudioPreloader } from '@/lib/audio-manager';
import { Button } from '@/components/ui/button';

export default function MoodBoardPage() {
  if (!isToolEnabled('mood-board')) return <WipPage toolName="Mood Board" />;
  return <MoodBoardContent />;
}

function MoodBoardContent() {
  // Get the 3 main templates
  const templates = useMemo(() => {
    const forest = boardTemplates.find((t) => t.id === 'forest');
    const tavern = boardTemplates.find((t) => t.id === 'tavern');
    const dungeon = boardTemplates.find((t) => t.id === 'dungeon');
    return [forest, tavern, dungeon].filter((t): t is BoardTemplate => t !== undefined);
  }, []);

  const [currentMood, setCurrentMood] = useState<Mood>(
    templates[0]?.mood || boardTemplates[0].mood
  );
  const isLightMode = useIsLightMode();

  // Get all audio URLs for the current mood
  const audioUrls = useMemo(() => {
    const urls: string[] = [];
    currentMood.ambience.forEach((s) => urls.push(s.audioSrc));
    currentMood.effects.forEach((s) => urls.push(s.audioSrc));
    return urls;
  }, [currentMood]);

  // Preload audio files for current mood
  const { progress: preloadProgress, isComplete: isPreloaded } = useAudioPreloader(audioUrls);

  const theme = currentMood.theme;

  return (
    <div
      className={cn(
        'flex-1 transition-colors duration-300',
        isLightMode ? 'bg-[#f0f0f2]' : 'bg-[#0a0a0b]'
      )}
    >
      {/* Subtle gradient background */}
      <div
        className={cn(
          'fixed inset-0 pointer-events-none transition-opacity duration-300',
          isLightMode ? 'opacity-20' : 'opacity-30'
        )}
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${theme?.secondary ?? '#3b82f6'}15 0%, transparent 50%)`,
        }}
      />

      <ToolPageHeader
        heading="Mood Board"
        subtitle={
          <span className="flex items-center gap-2">
            Virtual soundboard for immersive audio
            {!isPreloaded && (
              <span className="flex items-center gap-1 text-xs opacity-60">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading ({Math.round(preloadProgress * 100)}%)
              </span>
            )}
          </span>
        }
        icon={<Music className="h-5 w-5" />}
        iconColor={theme?.primary ?? '#22c55e'}
        maxWidth="max-w-5xl"
      >
        <Button
          variant="ghost"
          size="sm"
          asChild
          className={cn(
            'rounded-full text-xs',
            isLightMode
              ? 'bg-zinc-900/10 border border-zinc-900/10 text-zinc-600 hover:bg-zinc-900/20 hover:text-zinc-800'
              : 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
          )}
        >
          <Link href="/mood-board/builder">
            <Wrench className="h-3 w-3" />
            Builder
          </Link>
        </Button>
      </ToolPageHeader>

      <div className="relative container mx-auto max-w-5xl px-4 py-8">
        {/* Template Selector */}
        <div className="mb-8">
          <div
            className={cn(
              'inline-flex gap-1 p-1 rounded-xl transition-colors',
              isLightMode
                ? 'bg-white border border-zinc-200 shadow-sm'
                : 'bg-black/50 border border-white/5'
            )}
          >
            {templates.map((template) => {
              const isSelected = currentMood.id === template.mood.id;
              const templateColor = template.mood.theme?.secondary ?? '#3b82f6';

              return (
                <Button
                  key={template.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMood(template.mood)}
                  className={cn(
                    'rounded-lg',
                    isSelected
                      ? isLightMode
                        ? 'text-zinc-800 shadow-md'
                        : 'text-white shadow-lg'
                      : isLightMode
                        ? 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  )}
                  style={
                    isSelected
                      ? {
                          background: isLightMode
                            ? `linear-gradient(135deg, ${templateColor}20 0%, ${templateColor}10 100%)`
                            : `linear-gradient(135deg, ${templateColor}40 0%, ${templateColor}20 100%)`,
                          boxShadow: `0 4px 20px ${templateColor}${isLightMode ? '20' : '30'}`,
                        }
                      : undefined
                  }
                >
                  {template.name}
                </Button>
              );
            })}
          </div>
          {currentMood.description && (
            <p
              className={cn(
                'mt-3 text-sm transition-colors',
                isLightMode ? 'text-zinc-500' : 'text-zinc-500'
              )}
            >
              {currentMood.description}
            </p>
          )}
        </div>

        {/* Mood Board - Effect Heavy layout: effects first, square effects, rectangular ambience */}
        <MoodBoard
          mood={currentMood}
          isLightMode={isLightMode}
          effectsFirst
          squareEffects
          rectangularAmbience
        />

        {/* Footer Info - subtle panel */}
        <div
          className={cn(
            'mt-12 rounded-xl p-4 transition-colors',
            isLightMode
              ? 'bg-white border border-zinc-200 shadow-sm'
              : 'bg-black/30 border border-white/5'
          )}
        >
          <h2
            className={cn(
              'font-medium transition-colors',
              isLightMode ? 'text-zinc-700' : 'text-zinc-300'
            )}
          >
            Getting Started
          </h2>
          <p
            className={cn(
              'mt-1 text-sm transition-colors',
              isLightMode ? 'text-zinc-500' : 'text-zinc-500'
            )}
          >
            Add audio files to{' '}
            <code
              className={cn(
                'rounded px-1.5 py-0.5 font-mono text-xs transition-colors',
                isLightMode ? 'bg-zinc-100 text-zinc-600' : 'bg-white/5 text-zinc-400'
              )}
            >
              public/audio/
            </code>
            . Ambience sounds loop continuously, effects play once. Use the fade toggle for smooth
            transitions between sounds.
          </p>
        </div>
      </div>
    </div>
  );
}
