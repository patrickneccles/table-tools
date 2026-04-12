/**
 * Site-wide active system store.
 *
 * Shared localStorage key so that choosing a system in the stat block tool
 * automatically carries over to the spell block tool (and vice versa).
 * Each tool resolves the stored ID against its own registry and falls back
 * to its own default when the stored system isn't available.
 */

import { useSyncExternalStore } from 'react';

const ACTIVE_SYSTEM_KEY = 'tabletools-active-system';

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((cb) => cb());
}

export function subscribeActiveSystem(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === ACTIVE_SYSTEM_KEY || e.key === null) onStoreChange();
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }
  return () => {
    listeners.delete(onStoreChange);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

export function loadActiveSystem(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SYSTEM_KEY);
  } catch {
    return null;
  }
}

export function saveActiveSystem(systemId: string): void {
  try {
    localStorage.setItem(ACTIVE_SYSTEM_KEY, systemId);
    notifyListeners();
  } catch {
    /* ignore quota/security errors */
  }
}

/**
 * Returns `id` if it exists in `availableIds`, otherwise `defaultId`.
 * Use this to gracefully degrade when the shared system isn't registered
 * in the current tool's registry.
 */
export function resolveSystem(
  id: string | null,
  availableIds: string[],
  defaultId: string
): string {
  if (id && availableIds.includes(id)) return id;
  return defaultId;
}

/** React hook — SSR-safe via `useSyncExternalStore`. */
export function useActiveSystem(): string | null {
  return useSyncExternalStore(
    subscribeActiveSystem,
    () => loadActiveSystem(),
    () => null
  );
}
