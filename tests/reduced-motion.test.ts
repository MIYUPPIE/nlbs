/**
 * Regression: motion/react's useReducedMotion reads the media query during the
 * first client render, so reduced-motion visitors got hydration error #418 on
 * every page (the CTA's MovingBorderFrame) and React re-rendered the whole page.
 * Components must use the hydration-safe usePrefersReducedMotion hook instead.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(__dirname, "..", "src");
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(p) ? [p] : [];
  });

describe("reduced motion is read without a hydration mismatch", () => {
  it("nothing imports useReducedMotion from motion", () => {
    const offenders = walk(SRC).filter((p) =>
      /import\s*\{[^}]*\buseReducedMotion\b[^}]*\}\s*from\s*"motion/.test(readFileSync(p, "utf8")),
    );
    expect(offenders).toEqual([]);
  });

  it("nothing reads matchMedia during render (only the shared hook and effects)", () => {
    const allowed = new Set([
      join(SRC, "components/hooks/usePrefersReducedMotion.ts"),
      join(SRC, "components/motion/AnimatedNumber.tsx"), // inside useEffect
    ]);
    const readers = walk(SRC).filter(
      (p) => !allowed.has(p) && readFileSync(p, "utf8").includes("matchMedia"),
    );
    expect(readers).toEqual([]);
  });
});
