/**
 * Geometry for the speaker orbit (src/components/sections/SpeakerOrbit.tsx).
 *
 * The ring rotates in whole steps of 360/n degrees. `step` is a running
 * integer, not an index, so the ring always turns the short way, including
 * across the wrap from the last speaker to the first. The active speaker is
 * `activeIndex(step, n)` and always sits at the bottom (6 o'clock).
 *
 * Pure functions, unit-tested in tests/orbit.test.ts.
 */

/** Always-positive modulo. */
export const mod = (a: number, n: number): number => ((a % n) + n) % n;

/** Index of the speaker at the bottom of the ring. */
export const activeIndex = (step: number, n: number): number => mod(step, n);

/**
 * New step that brings `target` to the bottom by the shortest rotation.
 * Ties (exactly opposite) go forward.
 */
export function stepToward(step: number, target: number, n: number): number {
  const delta = mod(target - step, n);
  return delta > n / 2 ? step + delta - n : step + delta;
}

/** Ring rotation in degrees for a step (negative: turning brings later speakers down). */
export const ringRotation = (step: number, n: number): number => -(step * 360) / n;

/**
 * Resting position of speaker `i`, as percentages of the square container,
 * before ring rotation. Speaker 0 sits at the bottom; the rest follow clockwise
 * order on screen as the ring advances.
 */
export function slotPosition(i: number, n: number, radiusPct: number): { left: number; top: number } {
  const angle = ((90 + (i * 360) / n) * Math.PI) / 180;
  return {
    left: +(50 + Math.cos(angle) * radiusPct).toFixed(3),
    top: +(50 + Math.sin(angle) * radiusPct).toFixed(3),
  };
}

/** "01", "02", ... for the badge on the active speaker. */
export const badge = (i: number): string => String(i + 1).padStart(2, "0");
