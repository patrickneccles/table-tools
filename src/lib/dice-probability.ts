/**
 * Dice Probability Engine
 *
 * Computes the full probability distribution for a parsed dice expression.
 *
 * - Simple NdM rolls use discrete convolution (polynomial multiplication)
 * - Drop/keep rolls use full enumeration of ordered outcomes
 */

import type { ParsedExpression, DiceGroup, DropKeepOp } from './dice-parser';

/**
 * A discrete probability distribution.
 * probs[i] = probability of rolling (min + i).
 */
export type Distribution = {
  min: number;
  probs: number[];
};

export type DiceStats = {
  mean: number;
  median: number;
  mode: number;
  stdDev: number;
  min: number;
  max: number;
};

// ---------------------------------------------------------------------------
// Core math
// ---------------------------------------------------------------------------

/** Convolve two distributions (sum of independent rolls) */
function convolve(a: Distribution, b: Distribution): Distribution {
  const resultLen = a.probs.length + b.probs.length - 1;
  const probs = new Array<number>(resultLen).fill(0);

  for (let i = 0; i < a.probs.length; i++) {
    if (a.probs[i] === 0) continue;
    for (let j = 0; j < b.probs.length; j++) {
      probs[i + j] += a.probs[i] * b.probs[j];
    }
  }

  return { min: a.min + b.min, probs };
}

/** Uniform distribution for a single die with the given number of sides */
function singleDieDist(sides: number): Distribution {
  return { min: 1, probs: new Array<number>(sides).fill(1 / sides) };
}

/** Distribution for NdM — repeated convolution */
function simpleGroupDist(count: number, sides: number): Distribution {
  const die = singleDieDist(sides);
  // Identity: probability 1 of rolling 0 (neutral element for sum)
  let result: Distribution = { min: 0, probs: [1] };
  for (let i = 0; i < count; i++) {
    result = convolve(result, die);
  }
  return result;
}

/** Distribution for NdM with drop/keep — full ordered-outcome enumeration */
function dropKeepGroupDist(count: number, sides: number, op: DropKeepOp): Distribution {
  const total = Math.pow(sides, count);
  const sumCounts: Record<number, number> = {};

  for (let i = 0; i < total; i++) {
    const rolls: number[] = [];
    let n = i;
    for (let j = 0; j < count; j++) {
      rolls.push((n % sides) + 1);
      n = Math.floor(n / sides);
    }

    rolls.sort((a, b) => a - b); // ascending

    let kept: number[];
    switch (op.kind) {
      case 'kh':
        kept = rolls.slice(count - op.count);
        break;
      case 'kl':
        kept = rolls.slice(0, op.count);
        break;
      case 'dh':
        kept = rolls.slice(0, count - op.count);
        break;
      case 'dl':
        kept = rolls.slice(op.count);
        break;
    }

    const sum = kept.reduce((a, b) => a + b, 0);
    sumCounts[sum] = (sumCounts[sum] ?? 0) + 1;
  }

  const values = Object.keys(sumCounts)
    .map(Number)
    .sort((a, b) => a - b);
  const min = values[0];
  const max = values[values.length - 1];
  const probs = new Array<number>(max - min + 1).fill(0);

  for (const [v, c] of Object.entries(sumCounts)) {
    probs[Number(v) - min] = c / total;
  }

  return { min, probs };
}

function groupDist(group: DiceGroup): Distribution {
  return group.op
    ? dropKeepGroupDist(group.count, group.sides, group.op)
    : simpleGroupDist(group.count, group.sides);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Compute the full probability distribution for a parsed dice expression */
export function computeDistribution(expr: ParsedExpression): Distribution {
  let combined: Distribution = { min: 0, probs: [1] };

  for (const group of expr.groups) {
    combined = convolve(combined, groupDist(group));
  }

  // Apply flat modifier by shifting the distribution
  return { min: combined.min + expr.modifier, probs: combined.probs };
}

/** Compute summary statistics for a distribution */
export function computeStats(dist: Distribution): DiceStats {
  const { min, probs } = dist;
  const max = min + probs.length - 1;

  let mean = 0;
  let modeVal = min;
  let modeProb = -1;

  for (let i = 0; i < probs.length; i++) {
    const v = min + i;
    mean += v * probs[i];
    if (probs[i] > modeProb) {
      modeProb = probs[i];
      modeVal = v;
    }
  }

  // Median: first value where cumulative probability reaches 0.5
  let cumulative = 0;
  let median = min;
  for (let i = 0; i < probs.length; i++) {
    cumulative += probs[i];
    if (cumulative >= 0.5) {
      median = min + i;
      break;
    }
  }

  let variance = 0;
  for (let i = 0; i < probs.length; i++) {
    variance += probs[i] * (min + i - mean) ** 2;
  }

  return { mean, median, mode: modeVal, stdDev: Math.sqrt(variance), min, max };
}

/** Probability of rolling at most `target` (roll-under) */
export function probabilityAtMost(dist: Distribution, target: number): number {
  const max = dist.min + dist.probs.length - 1;
  if (target >= max) return 1;
  if (target < dist.min) return 0;
  let p = 0;
  for (let i = 0; i <= target - dist.min; i++) {
    p += dist.probs[i];
  }
  return p;
}

/** Probability of rolling at least `target` (roll-over) */
export function probabilityAtLeast(dist: Distribution, target: number): number {
  if (target <= dist.min) return 1;
  const max = dist.min + dist.probs.length - 1;
  if (target > max) return 0;
  let p = 0;
  for (let i = target - dist.min; i < dist.probs.length; i++) {
    p += dist.probs[i];
  }
  return p;
}

/** Probability of rolling exactly `target` */
export function probabilityExactly(dist: Distribution, target: number): number {
  const idx = target - dist.min;
  if (idx < 0 || idx >= dist.probs.length) return 0;
  return dist.probs[idx];
}

/** Format a probability as a percentage string (e.g. "16.7%") */
export function formatPct(p: number, decimals = 1): string {
  if (p <= 0) return '0%';
  if (p >= 0.9999) return '100%';
  const pct = p * 100;
  if (pct < 0.05) return '<0.1%';
  return pct.toFixed(decimals) + '%';
}

/** Format as approximate "1 in N" odds */
export function formatOdds(p: number): string {
  if (p <= 0) return 'impossible';
  if (p >= 0.9999) return 'certain';
  const n = Math.round(1 / p);
  return n <= 1 ? 'certain' : `1 in ${n}`;
}
