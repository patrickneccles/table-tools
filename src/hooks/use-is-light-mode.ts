'use client';

import { useSyncExternalStore } from 'react';
import { subscribeTheme, getThemeSnapshot, getThemeServerSnapshot } from '@/lib/theme-store';

export function useIsLightMode(): boolean {
  return useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);
}
