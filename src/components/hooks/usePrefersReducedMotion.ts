"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

/**
 * prefers-reduced-motion, safe for hydration. The server and the hydrating
 * render both see `false`, then React re-renders with the real value.
 *
 * Do not use `useReducedMotion` from motion/react: it reads the media query on
 * the first client render, so the HTML differs from the server's and React
 * throws hydration error #418 and re-renders the whole page for every
 * reduced-motion visitor (regression: e2e "no hydration errors under reduced
 * motion"; tests/reduced-motion.test.ts bans the import).
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
