"use client";

import { useEffect, useRef } from "react";

/**
 * Applies a `?name=` query value to a form field once, after hydration. The
 * site is prerendered as static files, so the query string is only known in
 * the browser. `pick` maps the raw value to an allowed field value, or null.
 */
export function useQueryPrefill(
  name: string,
  pick: (raw: string) => string | null,
  apply: (value: string) => void,
) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const raw = new URLSearchParams(window.location.search).get(name);
    const value = raw === null ? null : pick(raw);
    if (value !== null) apply(value);
  }, [name, pick, apply]);
}
