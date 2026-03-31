"use client";

import { useEffect, useState } from "react";

/**
 * Tracks `document.documentElement` light/dark theme (`.light` class).
 * Subscribes via MutationObserver so toggles from the footer stay in sync.
 */
export function useIsLightMode(): boolean {
  const [isLightMode, setIsLightMode] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("light")
      : false
  );

  useEffect(() => {
    const sync = () =>
      setIsLightMode(document.documentElement.classList.contains("light"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return isLightMode;
}
