import { describe, it, expect } from 'vitest';
import {
  computeRanges,
  formatRange,
  parseDieExpr,
  rollTable,
  totalWeight,
  validateTable,
  type TableEntry,
} from '../random-table-utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function entry(id: string, weight: number): TableEntry {
  return { id, result: `Result ${id}`, weight };
}

// ---------------------------------------------------------------------------
// parseDieExpr
// ---------------------------------------------------------------------------

describe('parseDieExpr', () => {
  it('parses a simple die expression', () => {
    const info = parseDieExpr('d20');
    expect(info).not.toBeNull();
    expect(info!.min).toBe(1);
    expect(info!.max).toBe(20);
    expect(info!.total).toBe(20);
    expect(info!.expr).toBe('d20');
  });

  it('parses a multi-die expression', () => {
    const info = parseDieExpr('2d6');
    expect(info).not.toBeNull();
    expect(info!.min).toBe(2);
    expect(info!.max).toBe(12);
    expect(info!.total).toBe(11);
  });

  it('trims whitespace', () => {
    expect(parseDieExpr('  d12  ')).not.toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseDieExpr('')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    expect(parseDieExpr('   ')).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(parseDieExpr(undefined)).toBeNull();
  });

  it('returns null for null', () => {
    expect(parseDieExpr(null)).toBeNull();
  });

  it('returns null for an invalid expression', () => {
    expect(parseDieExpr('banana')).toBeNull();
  });

  it('returns null for a flat constant (no range)', () => {
    // A constant like "5" has min === max, so it is not useful as a table die
    expect(parseDieExpr('5')).toBeNull();
  });

  it('normalises the stored expr to the trimmed value', () => {
    const info = parseDieExpr('  2d6  ');
    expect(info!.expr).toBe('2d6');
  });
});

// ---------------------------------------------------------------------------
// totalWeight
// ---------------------------------------------------------------------------

describe('totalWeight', () => {
  it('sums weights', () => {
    expect(totalWeight([entry('a', 2), entry('b', 3), entry('c', 1)])).toBe(6);
  });

  it('returns 0 for an empty list', () => {
    expect(totalWeight([])).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// computeRanges
// ---------------------------------------------------------------------------

describe('computeRanges', () => {
  it('assigns sequential ranges starting at 1 by default', () => {
    const ranges = computeRanges([entry('a', 1), entry('b', 2), entry('c', 1)]);
    expect(ranges).toEqual([
      { min: 1, max: 1 },
      { min: 2, max: 3 },
      { min: 4, max: 4 },
    ]);
  });

  it('respects a custom startAt value', () => {
    const ranges = computeRanges([entry('a', 1), entry('b', 1)], 2);
    expect(ranges).toEqual([
      { min: 2, max: 2 },
      { min: 3, max: 3 },
    ]);
  });

  it('returns an empty array for no entries', () => {
    expect(computeRanges([])).toEqual([]);
  });

  it('handles a single entry with weight > 1', () => {
    const ranges = computeRanges([entry('a', 6)]);
    expect(ranges).toEqual([{ min: 1, max: 6 }]);
  });
});

// ---------------------------------------------------------------------------
// validateTable
// ---------------------------------------------------------------------------

describe('validateTable', () => {
  it('returns ok when weights fill the die exactly', () => {
    const entries = Array.from({ length: 6 }, (_, i) => entry(String(i), 1));
    expect(validateTable('d6', entries)).toBe('ok');
  });

  it('returns under when weights are below capacity', () => {
    const entries = [entry('a', 1), entry('b', 1)];
    expect(validateTable('d6', entries)).toBe('under');
  });

  it('returns over when weights exceed capacity', () => {
    const entries = Array.from({ length: 7 }, (_, i) => entry(String(i), 1));
    expect(validateTable('d6', entries)).toBe('over');
  });

  it('returns empty when there are no entries', () => {
    expect(validateTable('d6', [])).toBe('empty');
  });

  it('returns invalid-expr for an unparseable die expression', () => {
    expect(validateTable('notadie', [entry('a', 1)])).toBe('invalid-expr');
  });

  it('handles 2d6 — 11 capacity', () => {
    const entries = Array.from({ length: 11 }, (_, i) => entry(String(i), 1));
    expect(validateTable('2d6', entries)).toBe('ok');
  });
});

// ---------------------------------------------------------------------------
// formatRange
// ---------------------------------------------------------------------------

describe('formatRange', () => {
  it('shows a single number when min equals max', () => {
    expect(formatRange({ min: 5, max: 5 })).toBe('5');
  });

  it('shows a range when min differs from max', () => {
    expect(formatRange({ min: 3, max: 7 })).toBe('3–7');
  });
});

// ---------------------------------------------------------------------------
// rollTable
// ---------------------------------------------------------------------------

describe('rollTable', () => {
  it('returns null for an empty entry list', () => {
    expect(rollTable('d6', [])).toBeNull();
  });

  it('returns null for an invalid die expression', () => {
    const entries = [entry('a', 1)];
    expect(rollTable('notadie', entries)).toBeNull();
  });

  it('returns a result with a roll, matched entry, and range', () => {
    const entries = Array.from({ length: 6 }, (_, i) => entry(String(i + 1), 1));
    const result = rollTable('d6', entries);
    expect(result).not.toBeNull();
    expect(result!.roll).toBeGreaterThanOrEqual(1);
    expect(result!.roll).toBeLessThanOrEqual(6);
    expect(result!.entry).toBeDefined();
    expect(result!.range.min).toBeLessThanOrEqual(result!.roll);
    expect(result!.range.max).toBeGreaterThanOrEqual(result!.roll);
  });

  it('always matches the roll to the correct entry', () => {
    // Run many rolls and verify the matched entry always covers the rolled value
    const entries = [entry('low', 3), entry('mid', 4), entry('high', 3)];
    for (let i = 0; i < 50; i++) {
      const result = rollTable('d10', entries);
      expect(result).not.toBeNull();
      expect(result!.roll).toBeGreaterThanOrEqual(result!.range.min);
      expect(result!.roll).toBeLessThanOrEqual(result!.range.max);
    }
  });
});
