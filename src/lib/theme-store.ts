/**
 * Shared theme store for useSyncExternalStore.
 *
 * The inline <script> in layout.tsx applies the saved class before React runs,
 * so getThemeSnapshot() always reads the correct value on the client even on
 * the first render. React's useSyncExternalStore handles the server/client
 * snapshot difference (false vs. actual value) with a synchronous client-side
 * correction before the browser paints, eliminating the flash.
 */

const themeListeners = new Set<() => void>();

export function emitThemeChange(): void {
  themeListeners.forEach((cb) => cb());
}

export function subscribeTheme(onStoreChange: () => void): () => void {
  themeListeners.add(onStoreChange);
  return () => themeListeners.delete(onStoreChange);
}

export function getThemeSnapshot(): boolean {
  return document.documentElement.classList.contains('light');
}

export function getThemeServerSnapshot(): boolean {
  return false;
}
