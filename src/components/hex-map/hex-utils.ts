/**
 * Pure utility functions for hex grid logic.
 * Kept separate from canvas.tsx so they can be unit-tested without component setup.
 */

export function generateHexes(
  width: number,
  height: number,
  color: string,
  orientation: 'flat' | 'pointy' = 'flat'
): { q: number; r: number; color: string }[] {
  const hexes: { q: number; r: number; color: string }[] = [];
  if (orientation === 'flat') {
    for (let col = 0; col < width; col++) {
      for (let row = 0; row < height; row++) {
        const q = col;
        const r = row - Math.floor(col / 2);
        hexes.push({ q, r, color });
      }
    }
  } else {
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const q = col - Math.floor(row / 2);
        const r = row;
        hexes.push({ q, r, color });
      }
    }
  }
  return hexes;
}

/**
 * Derives grid dimensions from a set of flat-top hex coordinates.
 * Width is derived from the q range; height from the per-column row count.
 * Falls back to 12×12 for an empty array.
 */
export function deriveDimensions(hexes: { q: number; r: number }[]): {
  width: number;
  height: number;
} {
  if (hexes.length === 0) return { width: 12, height: 12 };
  const qs = hexes.map((h) => h.q);
  const width = Math.max(...qs) - Math.min(...qs) + 1;
  const rowsPerCol: Record<number, Set<number>> = {};
  hexes.forEach((h) => {
    const row = h.r + Math.floor(h.q / 2);
    if (!rowsPerCol[h.q]) rowsPerCol[h.q] = new Set();
    rowsPerCol[h.q].add(row);
  });
  const height = Math.max(...Object.values(rowsPerCol).map((s) => s.size));
  return { width, height };
}

/**
 * Regenerate a hex grid from new dimensions and stagger offsets, preserving
 * any painted cells from the previous grid.
 *
 * colOffset (flat-top): axial q value of column 0. Determines whether the
 * leftmost column starts in the "up" (even q) or "down" (odd q) position.
 *
 * rowOffset (pointy-top): axial r value of row 0. Determines whether the
 * topmost row starts in the "left" (even r) or "right" (odd r) position.
 *
 * This is the pure-function equivalent of the canvas regeneration useEffect.
 */
export function regenerateGrid<T extends { q: number; r: number }>(
  width: number,
  height: number,
  colOffset: number,
  rowOffset: number,
  orientation: 'flat' | 'pointy',
  blank: (q: number, r: number) => T,
  prevHexes: T[] = []
): T[] {
  const prevMap = new Map(prevHexes.map((h) => [`${h.q},${h.r}`, h]));
  const newHexes: T[] = [];
  if (orientation === 'flat') {
    for (let col = 0; col < width; col++) {
      for (let row = 0; row < height; row++) {
        const q = col + colOffset;
        const r = row - Math.floor(q / 2);
        newHexes.push(prevMap.get(`${q},${r}`) ?? blank(q, r));
      }
    }
  } else {
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const r = row + rowOffset;
        const q = col - Math.floor(r / 2);
        newHexes.push(prevMap.get(`${q},${r}`) ?? blank(q, r));
      }
    }
  }
  return newHexes;
}

export function getHexNeighbors(q: number, r: number): { q: number; r: number }[] {
  const directions: [number, number][] = [
    [+1, 0],
    [0, +1],
    [-1, +1],
    [-1, 0],
    [0, -1],
    [+1, -1],
  ];
  return directions.map(([dq, dr]) => ({ q: q + dq, r: r + dr }));
}
