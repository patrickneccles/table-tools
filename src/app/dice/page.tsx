'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useIsLightMode } from '@/hooks/use-is-light-mode';
import { cn } from '@/lib/utils';
import { parseDiceExpression, DiceParseError } from '@/lib/dice-parser';
import {
  computeDistribution,
  computeStats,
  probabilityAtLeast,
  probabilityAtMost,
  probabilityExactly,
  formatPct,
  formatOdds,
  type Distribution,
  type DiceStats,
} from '@/lib/dice-probability';
import { DistributionChart } from '@/components/dice/distribution-chart';
import { BarChart2 } from 'lucide-react';
import { ToolPageHeader } from '@/components/layout/tool-page-header';

// ---------------------------------------------------------------------------
// Presets — use shorthand expressions where applicable
// ---------------------------------------------------------------------------

const PRESETS = [
  { label: 'd20', expr: 'd20' },
  { label: 'Advantage', expr: 'adv' },
  { label: 'Disadvantage', expr: 'dis' },
  { label: '4d6 Drop 1', expr: '4d6dl1' },
  { label: '3d6', expr: '3d6' },
  { label: '2d6+3', expr: '2d6+3' },
  { label: 'd100', expr: 'd100' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function round2(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  isLightMode,
}: {
  label: string;
  value: string;
  isLightMode: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 rounded-xl border px-4 py-3',
        isLightMode ? 'bg-white border-zinc-200' : 'bg-zinc-900/50 border-zinc-800'
      )}
    >
      <span
        className={cn(
          'text-[10px] uppercase tracking-widest',
          isLightMode ? 'text-zinc-400' : 'text-zinc-500'
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'text-xl font-semibold tabular-nums',
          isLightMode ? 'text-zinc-800' : 'text-white'
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type RollDirection = 'over' | 'under';

export default function DicePage() {
  return (
    <Suspense>
      <DicePageContent />
    </Suspense>
  );
}

function DicePageContent() {
  const isLightMode = useIsLightMode();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialExpr = searchParams.get('expr') ?? '2d6';

  const [rawExpr, setRawExpr] = useState(initialExpr);
  const [distribution, setDistribution] = useState<Distribution | null>(null);
  const [stats, setStats] = useState<DiceStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetInput, setTargetInput] = useState('');
  const [rollDirection, setRollDirection] = useState<RollDirection>('over');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calculate = useCallback(
    (expr: string, { updateUrl = false } = {}) => {
      try {
        const parsed = parseDiceExpression(expr);
        const dist = computeDistribution(parsed);
        const s = computeStats(dist);
        setDistribution(dist);
        setStats(s);
        setError(null);
        setTargetInput((prev) => (prev === '' ? String(s.median) : prev));
        if (updateUrl) {
          const params = new URLSearchParams(searchParams.toString());
          params.set('expr', expr);
          router.replace(`?${params.toString()}`, { scroll: false });
        }
      } catch (e) {
        if (e instanceof DiceParseError) {
          setError(e.message);
        } else {
          setError('Could not compute distribution.');
        }
        setDistribution(null);
        setStats(null);
      }
    },
    [router, searchParams]
  );

  useEffect(() => {
    calculate(rawExpr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExprChange = (value: string) => {
    setRawExpr(value);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => calculate(value, { updateUrl: true }), 250);
  };

  const handlePreset = (expr: string) => {
    setRawExpr(expr);
    setError(null);
    calculate(expr, { updateUrl: true });
  };

  // Probability lookup
  const targetNum = parseInt(targetInput, 10);
  const hasValidTarget = !isNaN(targetNum) && distribution !== null;
  const pDirectional = hasValidTarget
    ? rollDirection === 'over'
      ? probabilityAtLeast(distribution, targetNum)
      : probabilityAtMost(distribution, targetNum)
    : null;
  const pExactly = hasValidTarget ? probabilityExactly(distribution, targetNum) : null;

  const threshold = hasValidTarget ? targetNum : null;

  const cardClass = cn(
    'transition-colors',
    isLightMode ? 'bg-white border-zinc-200' : 'bg-zinc-900/50 border-zinc-800'
  );

  const subduedText = isLightMode ? 'text-zinc-500' : 'text-zinc-400';
  const dimText = isLightMode ? 'text-zinc-400' : 'text-zinc-500';

  return (
    <div
      className={cn(
        'flex-1 transition-colors duration-300',
        isLightMode ? 'bg-[#f5f5f7]' : 'bg-[#0a0a0b]'
      )}
    >
      <ToolPageHeader
        heading="Dice Probability"
        subtitle="Visualize roll distributions for encounter design and DC setting"
        icon={<BarChart2 className="h-5 w-5" />}
        iconColor="#dc2626"
        maxWidth="max-w-4xl"
      />
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Expression input */}
        <Card className={cardClass}>
          <CardContent className="pt-5 space-y-3">
            <Input
              value={rawExpr}
              onChange={(e) => handleExprChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && calculate(rawExpr)}
              placeholder="e.g. 2d6+3, 4d6dl1, adv"
              className={cn(
                'font-mono text-base',
                isLightMode
                  ? 'bg-white border-zinc-300 text-zinc-800'
                  : 'bg-zinc-800/50 border-zinc-700 text-white'
              )}
              autoFocus
              spellCheck={false}
            />

            {error && <p className="text-xs text-red-500">{error}</p>}

            {/* Preset chips */}
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <Button
                  key={p.expr}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreset(p.expr)}
                  className={cn(
                    'h-7 text-xs font-mono',
                    rawExpr === p.expr
                      ? isLightMode
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-red-950/40 border-red-700 text-red-400'
                      : isLightMode
                        ? 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                  )}
                >
                  {p.label}
                </Button>
              ))}
            </div>

            {/* Notation guide */}
            <div className={cn('text-[11px] space-y-0.5', dimText)}>
              <p>
                <span className="font-mono">NdM</span> — e.g. <span className="font-mono">2d6</span>
                , <span className="font-mono">d20</span>,{' '}
                <span className="font-mono">1d8+2d4+3</span>
              </p>
              <p>
                Drop/keep: <span className="font-mono">dl</span> drop lowest ·{' '}
                <span className="font-mono">dh</span> drop highest ·{' '}
                <span className="font-mono">kh</span> keep highest ·{' '}
                <span className="font-mono">kl</span> keep lowest
              </p>
              <p>
                Shorthands: <span className="font-mono">adv</span>/
                <span className="font-mono">dis</span> attach to any die —{' '}
                <span className="font-mono">d12 adv</span> = 2d12kh1 ·{' '}
                <span className="font-mono">adv</span> alone = 2d20kh1
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Distribution chart */}
        {distribution && (
          <Card className={cardClass}>
            <CardHeader className="pb-2">
              <CardTitle className={cn('text-sm font-medium', subduedText)}>Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <DistributionChart
                distribution={distribution}
                threshold={threshold}
                thresholdMode={rollDirection}
                isLightMode={isLightMode}
              />
            </CardContent>
          </Card>
        )}

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <StatCard label="Mean" value={round2(stats.mean)} isLightMode={isLightMode} />
            <StatCard label="Median" value={String(stats.median)} isLightMode={isLightMode} />
            <StatCard label="Mode" value={String(stats.mode)} isLightMode={isLightMode} />
            <StatCard label="Range" value={`${stats.min}–${stats.max}`} isLightMode={isLightMode} />
            <StatCard label="Std Dev" value={stats.stdDev.toFixed(2)} isLightMode={isLightMode} />
          </div>
        )}

        {/* Probability lookup */}
        {distribution && stats && (
          <Card className={cardClass}>
            <CardHeader className="pb-3">
              <CardTitle
                className={cn(
                  'text-sm font-medium',
                  isLightMode ? 'text-zinc-700' : 'text-zinc-300'
                )}
              >
                Probability Lookup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Controls row */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm', subduedText)}>Target:</span>
                  <Input
                    type="number"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    min={stats.min}
                    max={stats.max}
                    className={cn(
                      'w-20 text-center font-mono',
                      isLightMode
                        ? 'bg-white border-zinc-300 text-zinc-800'
                        : 'bg-zinc-800/50 border-zinc-700 text-white'
                    )}
                  />
                </div>

                <ToggleGroup
                  type="single"
                  value={rollDirection}
                  onValueChange={(v) => {
                    if (v) setRollDirection(v as RollDirection);
                  }}
                  variant="outline"
                  size="sm"
                  className={cn(isLightMode ? 'border-zinc-200' : 'border-zinc-700')}
                >
                  <ToggleGroupItem
                    value="over"
                    className={cn(
                      'text-xs px-3',
                      isLightMode
                        ? 'data-[state=on]:bg-red-50 data-[state=on]:text-red-700 data-[state=on]:border-red-300'
                        : 'data-[state=on]:bg-red-950/40 data-[state=on]:text-red-400 data-[state=on]:border-red-700'
                    )}
                  >
                    Roll over (≥)
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="under"
                    className={cn(
                      'text-xs px-3',
                      isLightMode
                        ? 'data-[state=on]:bg-red-50 data-[state=on]:text-red-700 data-[state=on]:border-red-300'
                        : 'data-[state=on]:bg-red-950/40 data-[state=on]:text-red-400 data-[state=on]:border-red-700'
                    )}
                  >
                    Roll under (≤)
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {pDirectional !== null && pExactly !== null && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Directional probability */}
                  <div
                    className={cn(
                      'rounded-xl border p-4',
                      isLightMode
                        ? 'bg-zinc-50 border-zinc-200'
                        : 'bg-zinc-800/30 border-zinc-700/50'
                    )}
                  >
                    <p className={cn('text-xs mb-1', subduedText)}>
                      Roll{' '}
                      <strong className={isLightMode ? 'text-zinc-700' : 'text-zinc-300'}>
                        {rollDirection === 'over' ? '≥' : '≤'} {targetNum}
                      </strong>
                    </p>
                    <p className="text-2xl font-bold text-red-500">{formatPct(pDirectional)}</p>
                    <p className={cn('text-xs mt-0.5', dimText)}>{formatOdds(pDirectional)}</p>
                  </div>

                  {/* Exactly */}
                  <div
                    className={cn(
                      'rounded-xl border p-4',
                      isLightMode
                        ? 'bg-zinc-50 border-zinc-200'
                        : 'bg-zinc-800/30 border-zinc-700/50'
                    )}
                  >
                    <p className={cn('text-xs mb-1', subduedText)}>
                      Roll{' '}
                      <strong className={isLightMode ? 'text-zinc-700' : 'text-zinc-300'}>
                        exactly {targetNum}
                      </strong>
                    </p>
                    <p className="text-2xl font-bold" style={{ color: '#dc2626' }}>
                      {formatPct(pExactly)}
                    </p>
                    <p className={cn('text-xs mt-0.5', dimText)}>{formatOdds(pExactly)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
