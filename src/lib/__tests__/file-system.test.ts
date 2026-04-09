import { describe, expect, it } from 'vitest';
import {
  createFile,
  FILE_VERSION,
  isTableToolsFile,
  isValidFileType,
  parseFileJSON,
  renameFile,
  updateFile,
  VALID_FILE_TYPES,
} from '../file-system';

// ---------------------------------------------------------------------------
// createFile
// ---------------------------------------------------------------------------

describe('createFile', () => {
  it('sets the correct type, name, and data', () => {
    const file = createFile('stat-block', 'Goblin Boss', { hp: 21 });
    expect(file.type).toBe('stat-block');
    expect(file.name).toBe('Goblin Boss');
    expect(file.data).toEqual({ hp: 21 });
  });

  it('sets version to FILE_VERSION', () => {
    const file = createFile('hex-map', 'The Keep', {});
    expect(file.version).toBe(FILE_VERSION);
  });

  it('generates a unique id each time', () => {
    const a = createFile('stat-block', 'A', {});
    const b = createFile('stat-block', 'B', {});
    expect(a.id).not.toBe(b.id);
  });

  it('sets createdAt and updatedAt to the same ISO timestamp', () => {
    const before = new Date().toISOString();
    const file = createFile('stat-block', 'X', {});
    const after = new Date().toISOString();
    expect(file.createdAt).toBe(file.updatedAt);
    expect(file.createdAt >= before).toBe(true);
    expect(file.createdAt <= after).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// updateFile
// ---------------------------------------------------------------------------

describe('updateFile', () => {
  it('replaces data', () => {
    const file = createFile('stat-block', 'Goblin', { hp: 7 });
    const updated = updateFile(file, { hp: 15 });
    expect(updated.data).toEqual({ hp: 15 });
  });

  it('advances updatedAt', async () => {
    const file = createFile('stat-block', 'Goblin', { hp: 7 });
    // Small delay to guarantee timestamp difference
    await new Promise((r) => setTimeout(r, 5));
    const updated = updateFile(file, { hp: 15 });
    expect(updated.updatedAt >= file.updatedAt).toBe(true);
  });

  it('preserves id, version, type, name, and createdAt', () => {
    const file = createFile('stat-block', 'Goblin', { hp: 7 });
    const updated = updateFile(file, { hp: 99 });
    expect(updated.id).toBe(file.id);
    expect(updated.version).toBe(file.version);
    expect(updated.type).toBe(file.type);
    expect(updated.name).toBe(file.name);
    expect(updated.createdAt).toBe(file.createdAt);
  });

  it('does not mutate the original file', () => {
    const file = createFile('stat-block', 'Goblin', { hp: 7 });
    updateFile(file, { hp: 99 });
    expect(file.data).toEqual({ hp: 7 });
  });
});

// ---------------------------------------------------------------------------
// renameFile
// ---------------------------------------------------------------------------

describe('renameFile', () => {
  it('updates the name', () => {
    const file = createFile('stat-block', 'Goblin', {});
    const renamed = renameFile(file, 'Goblin Boss');
    expect(renamed.name).toBe('Goblin Boss');
  });

  it('preserves id and data', () => {
    const file = createFile('stat-block', 'Goblin', { hp: 7 });
    const renamed = renameFile(file, 'Goblin Boss');
    expect(renamed.id).toBe(file.id);
    expect(renamed.data).toEqual({ hp: 7 });
  });

  it('does not mutate the original file', () => {
    const file = createFile('stat-block', 'Goblin', {});
    renameFile(file, 'Other');
    expect(file.name).toBe('Goblin');
  });
});

// ---------------------------------------------------------------------------
// isValidFileType
// ---------------------------------------------------------------------------

describe('isValidFileType', () => {
  it('returns true for all known types', () => {
    for (const type of VALID_FILE_TYPES) {
      expect(isValidFileType(type)).toBe(true);
    }
  });

  it('returns false for unknown strings', () => {
    expect(isValidFileType('spell-block')).toBe(false);
    expect(isValidFileType('')).toBe(false);
    expect(isValidFileType('STAT-BLOCK')).toBe(false);
  });

  it('returns false for non-string values', () => {
    expect(isValidFileType(null)).toBe(false);
    expect(isValidFileType(42)).toBe(false);
    expect(isValidFileType(undefined)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isTableToolsFile
// ---------------------------------------------------------------------------

describe('isTableToolsFile', () => {
  it('returns true for a well-formed file', () => {
    const file = createFile('stat-block', 'Goblin', { hp: 7 });
    expect(isTableToolsFile(file)).toBe(true);
  });

  it('returns false for null or primitives', () => {
    expect(isTableToolsFile(null)).toBe(false);
    expect(isTableToolsFile('string')).toBe(false);
    expect(isTableToolsFile(42)).toBe(false);
  });

  it('returns false when required fields are missing', () => {
    expect(isTableToolsFile({ id: 'x', version: '1', type: 'stat-block' })).toBe(false);
  });

  it('returns false when field types are wrong', () => {
    const file = createFile('stat-block', 'Goblin', {});
    expect(isTableToolsFile({ ...file, id: 123 })).toBe(false);
    expect(isTableToolsFile({ ...file, name: null })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// parseFileJSON
// ---------------------------------------------------------------------------

describe('parseFileJSON', () => {
  it('parses and returns a valid Table Tools file', () => {
    const file = createFile('hex-map', 'The Keep', { cells: [] });
    const parsed = parseFileJSON(JSON.stringify(file));
    expect(parsed).toEqual(file);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseFileJSON('not json')).toThrow('not valid JSON');
  });

  it('throws when the object is not a Table Tools file', () => {
    expect(() => parseFileJSON(JSON.stringify({ foo: 'bar' }))).toThrow(
      'does not appear to be a Table Tools file'
    );
  });

  it('throws on an unknown file type', () => {
    const file = createFile('stat-block', 'X', {});
    const tampered = { ...file, type: 'spell-block' };
    expect(() => parseFileJSON(JSON.stringify(tampered))).toThrow('Unknown file type');
  });

  it('preserves nested data structures', () => {
    const data = { traits: [{ name: 'Darkvision', description: '60 ft.' }], hp: 21 };
    const file = createFile('stat-block', 'Goblin Boss', data);
    const parsed = parseFileJSON(JSON.stringify(file));
    expect(parsed.data).toEqual(data);
  });
});
