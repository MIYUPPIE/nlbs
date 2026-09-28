"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** False during SSR and the hydration pass, true once React owns the DOM. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
