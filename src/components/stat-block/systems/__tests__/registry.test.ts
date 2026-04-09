import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SYSTEM_ID,
  getAllSystemMetadata,
  getAllSystems,
  getSystem,
  SYSTEM_REGISTRY,
} from '../registry';

describe('SYSTEM_REGISTRY', () => {
  it('contains all three supported systems', () => {
    const ids = Object.keys(SYSTEM_REGISTRY);
    expect(ids).toContain('dnd5e-2014');
    expect(ids).toContain('dnd5e-2024');
    expect(ids).toContain('shadowdark');
  });

  it('each system has a schema and a Renderer', () => {
    for (const system of Object.values(SYSTEM_REGISTRY)) {
      expect(system.schema).toBeDefined();
      expect(system.Renderer).toBeDefined();
    }
  });
});

describe('DEFAULT_SYSTEM_ID', () => {
  it('is dnd5e-2024', () => {
    expect(DEFAULT_SYSTEM_ID).toBe('dnd5e-2024');
  });

  it('exists in the registry', () => {
    expect(SYSTEM_REGISTRY[DEFAULT_SYSTEM_ID]).toBeDefined();
  });
});

describe('getSystem', () => {
  it('returns the correct system for each known id', () => {
    expect(getSystem('dnd5e-2014')?.schema.metadata.id).toBe('dnd5e-2014');
    expect(getSystem('dnd5e-2024')?.schema.metadata.id).toBe('dnd5e-2024');
    expect(getSystem('shadowdark')?.schema.metadata.id).toBe('shadowdark');
  });

  it('returns undefined for an unknown id', () => {
    expect(getSystem('pathfinder')).toBeUndefined();
  });
});

describe('getAllSystems', () => {
  it('returns an array with one entry per registered system', () => {
    const systems = getAllSystems();
    expect(systems).toHaveLength(Object.keys(SYSTEM_REGISTRY).length);
  });

  it('every entry has a schema and Renderer', () => {
    for (const system of getAllSystems()) {
      expect(system.schema).toBeDefined();
      expect(system.Renderer).toBeDefined();
    }
  });
});

describe('getAllSystemMetadata', () => {
  it('returns metadata for every registered system', () => {
    const metadata = getAllSystemMetadata();
    expect(metadata).toHaveLength(Object.keys(SYSTEM_REGISTRY).length);
  });

  it('each metadata entry has id, name, description, and version', () => {
    for (const meta of getAllSystemMetadata()) {
      expect(typeof meta.id).toBe('string');
      expect(typeof meta.name).toBe('string');
      expect(typeof meta.description).toBe('string');
      expect(typeof meta.version).toBe('string');
    }
  });

  it('ids match the registry keys', () => {
    const registryIds = Object.keys(SYSTEM_REGISTRY).sort();
    const metadataIds = getAllSystemMetadata()
      .map((m) => m.id)
      .sort();
    expect(metadataIds).toEqual(registryIds);
  });
});
