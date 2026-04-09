import { describe, expect, it } from 'vitest';
import { exportHexGridV1, importHexGrid } from '../hex-map-file';

// ---------------------------------------------------------------------------
// exportHexGridV1
// ---------------------------------------------------------------------------

describe('exportHexGridV1', () => {
  it('always sets version to 1', () => {
    const result = exportHexGridV1({
      hexes: [],
      stroke: '#000',
      strokeWidth: 0,
      spacing: 2,
      orientation: 'flat',
    });
    expect(result.version).toBe(1);
  });

  it('passes all data fields through unchanged', () => {
    const hexes = [{ q: 1, r: -1, color: '#ff0000' }];
    const result = exportHexGridV1({
      hexes,
      stroke: '#888',
      strokeWidth: 3,
      spacing: 4,
      orientation: 'pointy',
    });
    expect(result.hexes).toBe(hexes); // same reference
    expect(result.stroke).toBe('#888');
    expect(result.strokeWidth).toBe(3);
    expect(result.spacing).toBe(4);
    expect(result.orientation).toBe('pointy');
  });
});

// ---------------------------------------------------------------------------
// importHexGrid
// ---------------------------------------------------------------------------

describe('importHexGrid', () => {
  it('accepts a valid v1 object', () => {
    const result = importHexGrid({
      version: 1,
      hexes: [],
      stroke: '#000',
      strokeWidth: 0,
      spacing: 2,
      orientation: 'flat',
    });
    expect(result.version).toBe(1);
    expect(result.orientation).toBe('flat');
  });

  it('accepts a legacy object with no version field but a hexes array', () => {
    const result = importHexGrid({
      hexes: [{ q: 0, r: 0, color: '#fff' }],
      stroke: '#000',
      strokeWidth: 0,
      spacing: 2,
      orientation: 'pointy',
    });
    expect(result.version).toBe(1);
    expect(result.orientation).toBe('pointy');
  });

  it('throws on an unsupported version number', () => {
    expect(() => importHexGrid({ version: 2, hexes: [] })).toThrow('Unsupported hex file version');
  });

  it('throws when version is present but not 1 and hexes is absent', () => {
    expect(() => importHexGrid({ version: 99 })).toThrow('Unsupported hex file version');
  });

  it('throws when neither version nor hexes is present', () => {
    expect(() => importHexGrid({ stroke: '#000' })).toThrow('Unsupported hex file version');
  });

  it('round-trips through export and import, preserving all fields', () => {
    const hexes = [
      { q: 0, r: 0, color: '#ff0000', stamp: 'tree' },
      { q: 1, r: -1, color: '#00ff00' },
    ];
    const exported = exportHexGridV1({
      hexes,
      stroke: '#333333',
      strokeWidth: 2,
      spacing: 3,
      orientation: 'flat',
    });
    const imported = importHexGrid(exported);

    expect(imported.version).toBe(1);
    expect(imported.hexes).toEqual(hexes);
    expect(imported.stroke).toBe('#333333');
    expect(imported.strokeWidth).toBe(2);
    expect(imported.spacing).toBe(3);
    expect(imported.orientation).toBe('flat');
  });

  it('round-trip preserves hex labels', () => {
    const hexes = [{ q: 0, r: 0, color: '#fff', label: 'Capital' }];
    const imported = importHexGrid(
      exportHexGridV1({
        hexes,
        stroke: '#000',
        strokeWidth: 0,
        spacing: 2,
        orientation: 'flat',
      })
    );
    expect((imported.hexes[0] as { label?: string }).label).toBe('Capital');
  });
});
