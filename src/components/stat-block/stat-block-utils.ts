// ============================================================================
// CR to XP Mapping (D&D 5e)
// ============================================================================

export const CR_XP_TABLE: Record<string, number> = {
  '0': 10,
  '1/8': 25,
  '1/4': 50,
  '1/2': 100,
  '1': 200,
  '2': 450,
  '3': 700,
  '4': 1100,
  '5': 1800,
  '6': 2300,
  '7': 2900,
  '8': 3900,
  '9': 5000,
  '10': 5900,
  '11': 7200,
  '12': 8400,
  '13': 10000,
  '14': 11500,
  '15': 13000,
  '16': 15000,
  '17': 18000,
  '18': 20000,
  '19': 22000,
  '20': 25000,
  '21': 33000,
  '22': 41000,
  '23': 50000,
  '24': 62000,
  '25': 75000,
  '26': 90000,
  '27': 105000,
  '28': 120000,
  '29': 135000,
  '30': 155000,
};

/** Get XP for a given CR */
export function getXPForCR(cr: string): number | undefined {
  return CR_XP_TABLE[cr];
}

/** Get CR for a given XP (finds closest match) */
export function getCRForXP(xp: number): string | undefined {
  const entries = Object.entries(CR_XP_TABLE);
  for (const [cr, xpValue] of entries) {
    if (xpValue === xp) return cr;
  }
  // Find closest
  let closest = entries[0];
  for (const entry of entries) {
    if (Math.abs(entry[1] - xp) < Math.abs(closest[1] - xp)) {
      closest = entry;
    }
  }
  return closest[0];
}

// ============================================================================
// Hit Dice Calculator
// ============================================================================

/** Parse hit dice string like "4d8 + 4" or "6d8" */
export function parseHitDice(
  hitDice: string
): { count: number; die: number; modifier: number } | null {
  const match = hitDice.match(/(\d+)d(\d+)\s*([+-]\s*\d+)?/i);
  if (!match) return null;

  const count = parseInt(match[1]);
  const die = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3].replace(/\s/g, '')) : 0;

  return { count, die, modifier };
}

/** Calculate average HP from hit dice */
export function calculateAverageHP(hitDice: string): number | null {
  const parsed = parseHitDice(hitDice);
  if (!parsed) return null;

  const averageRoll = (parsed.die + 1) / 2;
  return Math.floor(parsed.count * averageRoll + parsed.modifier);
}

/** Generate hit dice string from HP and Constitution modifier */
export function generateHitDice(hp: number, conMod: number, size: string): string {
  const dieBySize: Record<string, number> = {
    tiny: 4,
    small: 6,
    medium: 8,
    large: 10,
    huge: 12,
    gargantuan: 20,
  };

  const die = dieBySize[size.toLowerCase()] || 8;
  const avgRoll = (die + 1) / 2;

  // Solve for dice count: hp = count * avgRoll + count * conMod
  // hp = count * (avgRoll + conMod)
  // count = hp / (avgRoll + conMod)
  const divisor = avgRoll + conMod;
  if (divisor <= 0) return `1d${die}`;

  const count = Math.max(1, Math.round(hp / divisor));
  const modifier = count * conMod;

  if (modifier === 0) return `${count}d${die}`;
  return modifier > 0 ? `${count}d${die} + ${modifier}` : `${count}d${die} - ${Math.abs(modifier)}`;
}

// ============================================================================
// Templates
// ============================================================================

/**
 * Minimal base type for stat block data - all systems must have at least a name
 */
export type BaseStatBlockData = {
  name: string;
  [key: string]: unknown;
};

/**
 * Generic stat block template that can hold any system's data
 */
export type StatBlockTemplate<T extends BaseStatBlockData = BaseStatBlockData> = {
  id: string;
  name: string;
  description?: string;
  /** Whether this creature is part of a System Reference Document */
  isSRD?: boolean;
  /** The stat block system this template belongs to */
  systemId: string;
  data: T;
};

/**
 * Template as stored in a JSON file or exported from a module.
 * Includes name so templates are self-describing.
 */
export type StatBlockTemplateExport<T extends BaseStatBlockData = BaseStatBlockData> = {
  id: string;
  systemId: string;
  name: string;
  data: T;
  description?: string;
  isSRD?: boolean;
};

/** Type for webpack require.context result (loads a directory of modules) */
type RequireContext = {
  keys: () => string[];
  (key: string): unknown;
};

/**
 * Load StatBlockTemplate[] from a webpack require.context (e.g. directory of JSON files).
 * Keys are relative paths like "./goblin.json"; each module is the parsed template object.
 */
export function loadTemplatesFromContext<T extends BaseStatBlockData>(
  context: RequireContext
): StatBlockTemplate<T>[] {
  const templates = context
    .keys()
    .map((key) => {
      const m = context(key) as StatBlockTemplate<T> | { default: StatBlockTemplate<T> };
      return (m && 'default' in m ? m.default : m) as StatBlockTemplate<T>;
    })
    .filter(
      (t): t is StatBlockTemplate<T> =>
        t != null && typeof t.id === 'string' && typeof t.name === 'string'
    );
  return templates.sort((a, b) => a.name.localeCompare(b.name));
}

// ============================================================================
// Local Storage Persistence
// ============================================================================

const STORAGE_KEY = 'tabletools-statblock-draft';
const SYSTEM_STORAGE_KEY = 'tabletools-statblock-system';

export function saveStatBlockToStorage(statBlock: BaseStatBlockData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statBlock));
  } catch (e) {
    console.warn('Failed to save stat block to localStorage:', e);
  }
}

export function loadStatBlockFromStorage(): BaseStatBlockData | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as BaseStatBlockData;
    }
  } catch (e) {
    console.warn('Failed to load stat block from localStorage:', e);
  }
  return null;
}

export function clearStatBlockStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear stat block from localStorage:', e);
  }
}

export function saveSystemToStorage(systemId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SYSTEM_STORAGE_KEY, systemId);
  } catch (e) {
    console.warn('Failed to save system to localStorage:', e);
  }
}

export function loadSystemFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(SYSTEM_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to load system from localStorage:', e);
  }
  return null;
}
