import { describe, expect, it } from 'vitest';
import { deriveDimensions, generateHexes, getHexNeighbors } from '../hex-utils';

// ---------------------------------------------------------------------------
// generateHexes
// ---------------------------------------------------------------------------

describe('generateHexes', () => {
  it('returns width × height hexes for flat orientation', () => {
    expect(generateHexes(4, 3, '#fff')).toHaveLength(12);
  });

  it('returns width × height hexes for pointy orientation', () => {
    expect(generateHexes(3, 5, '#fff', 'pointy')).toHaveLength(15);
  });

  it('sets the provided color on every hex', () => {
    const hexes = generateHexes(3, 3, '#abcdef');
    expect(hexes.every((h) => h.color === '#abcdef')).toBe(true);
  });

  it('produces unique q/r coordinates for flat orientation', () => {
    const hexes = generateHexes(5, 5, '#fff');
    const keys = new Set(hexes.map((h) => `${h.q},${h.r}`));
    expect(keys.size).toBe(hexes.length);
  });

  it('produces unique q/r coordinates for pointy orientation', () => {
    const hexes = generateHexes(5, 5, '#fff', 'pointy');
    const keys = new Set(hexes.map((h) => `${h.q},${h.r}`));
    expect(keys.size).toBe(hexes.length);
  });

  it('flat: first column has q=0 and height rows', () => {
    const hexes = generateHexes(4, 3, '#fff');
    const col0 = hexes.filter((h) => h.q === 0);
    expect(col0).toHaveLength(3);
    expect(col0.map((h) => h.r).sort((a, b) => a - b)).toEqual([0, 1, 2]);
  });

  it('flat: even columns shift r by floor(col/2)', () => {
    // col 2: r = row - floor(2/2) = row - 1, so r starts at -1
    const hexes = generateHexes(3, 3, '#fff');
    const col2 = hexes
      .filter((h) => h.q === 2)
      .map((h) => h.r)
      .sort((a, b) => a - b);
    expect(col2).toEqual([-1, 0, 1]);
  });

  it('pointy: first row has r=0 and width hexes', () => {
    const hexes = generateHexes(4, 3, '#fff', 'pointy');
    const row0 = hexes.filter((h) => h.r === 0);
    expect(row0).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// deriveDimensions
// ---------------------------------------------------------------------------

describe('deriveDimensions', () => {
  it('returns 12×12 defaults for an empty array', () => {
    expect(deriveDimensions([])).toEqual({ width: 12, height: 12 });
  });

  it('returns {1, 1} for a single hex at the origin', () => {
    expect(deriveDimensions([{ q: 0, r: 0 }])).toEqual({ width: 1, height: 1 });
  });

  it('returns {1, 1} for a single hex at an arbitrary position', () => {
    expect(deriveDimensions([{ q: 5, r: -3 }])).toEqual({ width: 1, height: 1 });
  });

  it('round-trips with generateHexes for various flat grid sizes', () => {
    const sizes: [number, number][] = [
      [1, 1],
      [3, 4],
      [10, 10],
      [5, 8],
      [12, 12],
    ];
    for (const [w, h] of sizes) {
      const hexes = generateHexes(w, h, '#fff');
      expect(deriveDimensions(hexes)).toEqual({ width: w, height: h });
    }
  });

  it('correctly derives width from q range', () => {
    // 3 columns: q = 0, 1, 2
    const hexes = generateHexes(3, 1, '#fff');
    expect(deriveDimensions(hexes).width).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// getHexNeighbors
// ---------------------------------------------------------------------------

describe('getHexNeighbors', () => {
  it('returns exactly 6 neighbors', () => {
    expect(getHexNeighbors(0, 0)).toHaveLength(6);
  });

  it('returns the 6 correct axial neighbors for the origin', () => {
    const neighbors = getHexNeighbors(0, 0);
    expect(neighbors).toEqual(
      expect.arrayContaining([
        { q: 1, r: 0 },
        { q: 0, r: 1 },
        { q: -1, r: 1 },
        { q: -1, r: 0 },
        { q: 0, r: -1 },
        { q: 1, r: -1 },
      ])
    );
  });

  it('offsets all neighbors correctly from a non-origin position', () => {
    const neighbors = getHexNeighbors(3, 2);
    expect(neighbors).toEqual(
      expect.arrayContaining([
        { q: 4, r: 2 },
        { q: 3, r: 3 },
        { q: 2, r: 3 },
        { q: 2, r: 2 },
        { q: 3, r: 1 },
        { q: 4, r: 1 },
      ])
    );
  });

  it('every neighbor differs from the source by exactly one axial step', () => {
    const neighbors = getHexNeighbors(5, -3);
    for (const n of neighbors) {
      const dq = Math.abs(n.q - 5);
      const dr = Math.abs(n.r - -3);
      // In cube coords: |dq| + |dr| + |ds| = 2 for a single step,
      // but in axial the step lengths are (1,0),(0,1),(-1,1),(-1,0),(0,-1),(1,-1)
      // so max(|dq|, |dr|) <= 1 and |dq|+|dr| <= 2
      expect(dq + dr).toBeLessThanOrEqual(2);
      expect(Math.max(dq, dr)).toBeLessThanOrEqual(1);
    }
  });
});
