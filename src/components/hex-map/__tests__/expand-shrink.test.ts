import { describe, it, expect } from 'vitest';
import { regenerateGrid } from '../hex-utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Hex = { q: number; r: number; color: string };

const blank = (q: number, r: number): Hex => ({ q, r, color: '#fff' });
const RED = '#f00';

function grid(
  width: number,
  height: number,
  colOffset: number,
  rowOffset: number,
  orientation: 'flat' | 'pointy',
  prev: Hex[] = []
): Hex[] {
  return regenerateGrid(width, height, colOffset, rowOffset, orientation, blank, prev);
}

// ---------------------------------------------------------------------------
// flat-top stagger — colOffset
//
// Visual stagger for flat-top: y ∝ r + q/2. With r = row − floor(q/2) this
// simplifies to y = row + frac(q/2). Even q → frac = 0 ("up"); odd q → 0.5 ("down").
// colOffset shifts which q value column 0 gets, changing the starting parity.
// ---------------------------------------------------------------------------

describe('flat-top stagger (colOffset)', () => {
  it('colOffset=0: leftmost column has q=0 (even — "up" position)', () => {
    const hexes = grid(3, 3, 0, 0, 'flat');
    expect(Math.min(...hexes.map((h) => h.q))).toBe(0);
  });

  it('colOffset=-1: leftmost column has q=-1 (odd — "down" position)', () => {
    const hexes = grid(4, 3, -1, 0, 'flat');
    expect(Math.min(...hexes.map((h) => h.q))).toBe(-1);
  });

  it('colOffset=-2: leftmost column has q=-2 (even — "up" again)', () => {
    const hexes = grid(5, 3, -2, 0, 'flat');
    expect(Math.min(...hexes.map((h) => h.q))).toBe(-2);
  });

  it('adjacent columns always have opposite stagger parities regardless of colOffset', () => {
    for (const offset of [0, -1, -2, 3]) {
      const hexes = grid(4, 2, offset, 0, 'flat');
      const qs = [...new Set(hexes.map((h) => h.q))].sort((a, b) => a - b);
      for (let i = 0; i < qs.length - 1; i++) {
        // Adjacent qs differ by 1, so parities must differ
        expect(Math.abs(qs[i]) % 2).not.toBe(Math.abs(qs[i + 1]) % 2);
      }
    }
  });

  it('expand-left: existing hexes keep their q values (visual positions unchanged)', () => {
    // Paint column 1 (q=1) red on a 3-wide grid
    const before = grid(3, 3, 0, 0, 'flat');
    const painted = before.map((h) => (h.q === 1 ? { ...h, color: RED } : h));

    // Simulate expand-left: colOffset -1, width +1
    const after = grid(4, 3, -1, 0, 'flat', painted);

    const preserved = after.filter((h) => h.q === 1);
    expect(preserved).toHaveLength(3);
    expect(preserved.every((h) => h.color === RED)).toBe(true);
  });

  it('expand-left: new leftmost column is blank', () => {
    const before = grid(3, 3, 0, 0, 'flat');
    const after = grid(4, 3, -1, 0, 'flat', before);

    const newCol = after.filter((h) => h.q === -1);
    expect(newCol).toHaveLength(3);
    expect(newCol.every((h) => h.color === '#fff')).toBe(true);
  });

  it('expand-left: total hex count increases by one column', () => {
    const before = grid(3, 3, 0, 0, 'flat');
    const after = grid(4, 3, -1, 0, 'flat', before);
    expect(after).toHaveLength(before.length + 3); // +height
  });

  it('shrink-left: leftmost column is removed', () => {
    const before = grid(3, 3, 0, 0, 'flat');
    const painted = before.map((h) => (h.q === 0 ? { ...h, color: RED } : h));

    // Simulate shrink-left: colOffset +1, width -1
    const after = grid(2, 3, 1, 0, 'flat', painted);

    expect(after.filter((h) => h.q === 0)).toHaveLength(0);
  });

  it('shrink-left: surviving columns keep their q values and painted state', () => {
    const before = grid(3, 3, 0, 0, 'flat');
    const painted = before.map((h) => (h.q === 2 ? { ...h, color: RED } : h));

    const after = grid(2, 3, 1, 0, 'flat', painted);

    const col2 = after.filter((h) => h.q === 2);
    expect(col2).toHaveLength(3);
    expect(col2.every((h) => h.color === RED)).toBe(true);
  });

  it('expand-left followed by shrink-left is a no-op for painted cells', () => {
    const before = grid(3, 3, 0, 0, 'flat');
    const painted = before.map((h) => (h.q === 1 ? { ...h, color: RED } : h));

    const expanded = grid(4, 3, -1, 0, 'flat', painted);
    const restored = grid(3, 3, 0, 0, 'flat', expanded);

    const col1 = restored.filter((h) => h.q === 1);
    expect(col1).toHaveLength(3);
    expect(col1.every((h) => h.color === RED)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// pointy-top stagger — rowOffset
//
// Visual stagger for pointy-top: x ∝ q + r/2. With q = col − floor(r/2) this
// simplifies to x = col + frac(r/2). Even r → frac = 0 ("left"); odd r → 0.5 ("right").
// rowOffset shifts which r value row 0 gets, changing the starting parity.
// ---------------------------------------------------------------------------

describe('pointy-top stagger (rowOffset)', () => {
  it('rowOffset=0: topmost row has r=0 (even — "left" position)', () => {
    const hexes = grid(3, 3, 0, 0, 'pointy');
    expect(Math.min(...hexes.map((h) => h.r))).toBe(0);
  });

  it('rowOffset=-1: topmost row has r=-1 (odd — "right" position)', () => {
    const hexes = grid(3, 4, 0, -1, 'pointy');
    expect(Math.min(...hexes.map((h) => h.r))).toBe(-1);
  });

  it('rowOffset=-2: topmost row has r=-2 (even — "left" again)', () => {
    const hexes = grid(3, 5, 0, -2, 'pointy');
    expect(Math.min(...hexes.map((h) => h.r))).toBe(-2);
  });

  it('adjacent rows always have opposite stagger parities regardless of rowOffset', () => {
    for (const offset of [0, -1, -2, 3]) {
      const hexes = grid(2, 4, 0, offset, 'pointy');
      const rs = [...new Set(hexes.map((h) => h.r))].sort((a, b) => a - b);
      for (let i = 0; i < rs.length - 1; i++) {
        expect(Math.abs(rs[i]) % 2).not.toBe(Math.abs(rs[i + 1]) % 2);
      }
    }
  });

  it('expand-top: existing hexes keep their r values (visual positions unchanged)', () => {
    const before = grid(3, 3, 0, 0, 'pointy');
    const painted = before.map((h) => (h.r === 1 ? { ...h, color: RED } : h));

    // Simulate expand-top: rowOffset -1, height +1
    const after = grid(3, 4, 0, -1, 'pointy', painted);

    const preserved = after.filter((h) => h.r === 1);
    expect(preserved).toHaveLength(3);
    expect(preserved.every((h) => h.color === RED)).toBe(true);
  });

  it('expand-top: new topmost row is blank', () => {
    const before = grid(3, 3, 0, 0, 'pointy');
    const after = grid(3, 4, 0, -1, 'pointy', before);

    const newRow = after.filter((h) => h.r === -1);
    expect(newRow).toHaveLength(3);
    expect(newRow.every((h) => h.color === '#fff')).toBe(true);
  });

  it('expand-top: total hex count increases by one row', () => {
    const before = grid(3, 3, 0, 0, 'pointy');
    const after = grid(3, 4, 0, -1, 'pointy', before);
    expect(after).toHaveLength(before.length + 3); // +width
  });

  it('shrink-top: topmost row is removed', () => {
    const before = grid(3, 3, 0, 0, 'pointy');
    const painted = before.map((h) => (h.r === 0 ? { ...h, color: RED } : h));

    // Simulate shrink-top: rowOffset +1, height -1
    const after = grid(3, 2, 0, 1, 'pointy', painted);

    expect(after.filter((h) => h.r === 0)).toHaveLength(0);
  });

  it('shrink-top: surviving rows keep their r values and painted state', () => {
    const before = grid(3, 3, 0, 0, 'pointy');
    const painted = before.map((h) => (h.r === 2 ? { ...h, color: RED } : h));

    const after = grid(3, 2, 0, 1, 'pointy', painted);

    const row2 = after.filter((h) => h.r === 2);
    expect(row2).toHaveLength(3);
    expect(row2.every((h) => h.color === RED)).toBe(true);
  });

  it('expand-top followed by shrink-top is a no-op for painted cells', () => {
    const before = grid(3, 3, 0, 0, 'pointy');
    const painted = before.map((h) => (h.r === 1 ? { ...h, color: RED } : h));

    const expanded = grid(3, 4, 0, -1, 'pointy', painted);
    const restored = grid(3, 3, 0, 0, 'pointy', expanded);

    const row1 = restored.filter((h) => h.r === 1);
    expect(row1).toHaveLength(3);
    expect(row1.every((h) => h.color === RED)).toBe(true);
  });
});
