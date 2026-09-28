"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts up to `value` the first time it scrolls into view.
 *
 * The server renders the final value, so crawlers, no-JS visitors and
 * reduced-motion users always see the real figure. Animation only runs if
 * the number starts off-screen, which avoids a visible reset flash.
 */
export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 1600,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    let frame = 0;
    // Deferred so the reset happens outside the effect body.
    const reset = requestAnimationFrame(() => setDisplay(0));
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(value * eased));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      cancelAnimationFrame(reset);
      cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, [value, duration]);

  const formatted = `${prefix}${display.toLocaleString("en-US")}${suffix}`;
  const final = `${prefix}${value.toLocaleString("en-US")}${suffix}`;

  return (
    <span ref={ref} className="tabular-nums">
      <span aria-hidden="true">{formatted}</span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
