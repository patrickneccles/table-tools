import { parseDiceExpression } from '@/lib/dice-parser';
import { computeDistribution } from '@/lib/dice-probability';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TableEntry = {
  id: string;
  result: string;
  weight: number;
};

export type RandomTableData = {
  name: string;
  /** Any valid dice expression: "d20", "2d6", "d100", etc. */
  dieExpr: string;
  entries: TableEntry[];
};

export type DieExprInfo = {
  expr: string;
  min: number;
  max: number;
  /** Total weight capacity — max - min + 1 */
  total: number;
};

export type RollResult = {
  roll: number;
  entry: TableEntry;
  range: { min: number; max: number };
};

export type ValidationStatus = 'ok' | 'under' | 'over' | 'empty' | 'invalid-expr';

export const DEFAULT_TABLE: RandomTableData = {
  name: 'Untitled Table',
  dieExpr: 'd20',
  entries: [],
};

// ---------------------------------------------------------------------------
// Die expression utilities
// ---------------------------------------------------------------------------

/** Parse a die expression and return its range info, or null if invalid. */
export function parseDieExpr(expr: string | undefined | null): DieExprInfo | null {
  if (expr == null) return null;
  const trimmed = expr.trim();
  if (!trimmed) return null;
  try {
    const parsed = parseDiceExpression(trimmed);
    const dist = computeDistribution(parsed);
    const min = dist.min;
    const max = dist.min + dist.probs.length - 1;
    if (min >= max) return null; // flat constant — not useful as a table die
    return { expr: trimmed, min, max, total: max - min + 1 };
  } catch {
    return null;
  }
}

/** Roll a die expression and return the result, or null on error. */
export function rollDieExpr(expr: string | undefined | null): number | null {
  if (expr == null) return null;
  try {
    const parsed = parseDiceExpression(expr.trim());
    let total = parsed.modifier;
    for (const group of parsed.groups) {
      const rolls = Array.from(
        { length: group.count },
        () => Math.floor(Math.random() * group.sides) + 1
      );
      if (group.op) {
        rolls.sort((a, b) => a - b);
        const { kind, count } = group.op;
        const kept =
          kind === 'kh'
            ? rolls.slice(rolls.length - count)
            : kind === 'kl'
              ? rolls.slice(0, count)
              : kind === 'dh'
                ? rolls.slice(0, rolls.length - count)
                : rolls.slice(count);
        total += kept.reduce((a, b) => a + b, 0);
      } else {
        total += rolls.reduce((a, b) => a + b, 0);
      }
    }
    return total;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Table utilities
// ---------------------------------------------------------------------------

export function totalWeight(entries: TableEntry[]): number {
  return entries.reduce((sum, e) => sum + e.weight, 0);
}

/** Compute display ranges for each entry starting at `startAt` (default 1). */
export function computeRanges(
  entries: TableEntry[],
  startAt = 1
): Array<{ min: number; max: number }> {
  let cursor = startAt;
  return entries.map((entry) => {
    const range = { min: cursor, max: cursor + entry.weight - 1 };
    cursor += entry.weight;
    return range;
  });
}

export function rollTable(dieExpr: string, entries: TableEntry[]): RollResult | null {
  if (entries.length === 0) return null;
  const roll = rollDieExpr(dieExpr);
  if (roll === null) return null;
  const info = parseDieExpr(dieExpr);
  const ranges = computeRanges(entries, info?.min ?? 1);
  for (let i = 0; i < entries.length; i++) {
    if (roll >= ranges[i].min && roll <= ranges[i].max) {
      return { roll, entry: entries[i], range: ranges[i] };
    }
  }
  return null;
}

export function validateTable(dieExpr: string, entries: TableEntry[]): ValidationStatus {
  const info = parseDieExpr(dieExpr);
  if (!info) return 'invalid-expr';
  if (entries.length === 0) return 'empty';
  const used = totalWeight(entries);
  if (used === info.total) return 'ok';
  return used < info.total ? 'under' : 'over';
}

export function formatRange(range: { min: number; max: number }): string {
  return range.min === range.max ? String(range.min) : `${range.min}–${range.max}`;
}

export function newEntry(): TableEntry {
  return { id: crypto.randomUUID(), result: '', weight: 1 };
}
