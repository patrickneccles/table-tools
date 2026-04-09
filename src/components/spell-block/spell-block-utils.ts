const SPELL_DATA_KEY = 'spell-block-data';
const SPELL_SYSTEM_KEY = 'spell-block-system';

const spellSystemIdListeners = new Set<() => void>();

function notifySpellSystemIdListeners() {
  spellSystemIdListeners.forEach((cb) => cb());
}

/** For `useSyncExternalStore` when binding spell system id to localStorage. */
export function subscribeSpellSystemId(onStoreChange: () => void): () => void {
  spellSystemIdListeners.add(onStoreChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === SPELL_SYSTEM_KEY || e.key === null) onStoreChange();
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }
  return () => {
    spellSystemIdListeners.delete(onStoreChange);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

export function saveSpellToStorage(data: unknown): void {
  try {
    localStorage.setItem(SPELL_DATA_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota/security errors */
  }
}

export function loadSpellFromStorage(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(SPELL_DATA_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function saveSpellSystemToStorage(systemId: string): void {
  try {
    localStorage.setItem(SPELL_SYSTEM_KEY, systemId);
    notifySpellSystemIdListeners();
  } catch {
    /* ignore */
  }
}

export function loadSpellSystemFromStorage(): string | null {
  try {
    return localStorage.getItem(SPELL_SYSTEM_KEY);
  } catch {
    return null;
  }
}
