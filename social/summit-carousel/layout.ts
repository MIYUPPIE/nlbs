/**
 * Geometry for the seamless carousel: one panorama of N slides, cut into
 * equal 1080x1350 (4:5) slides. Pure functions, no DOM.
 */
export const SLIDE_W = 1080;
export const SLIDE_H = 1350;
export const SLIDE_COUNT = 7;
export const PANORAMA_W = SLIDE_W * SLIDE_COUNT;

/** Text must sit at least this far from every slide edge. */
export const TEXT_SAFE = 60;
/** A decoration "crosses" a join when it reaches this far into both slides. */
export const CROSS_REACH = 40;

/** x positions of the joins between slides (1..N-1). */
export const joins = (): number[] => Array.from({ length: SLIDE_COUNT - 1 }, (_, i) => (i + 1) * SLIDE_W);

/** Left edge of slide `index` (0-based) in panorama coordinates. */
export const slideX = (index: number): number => index * SLIDE_W;

export type Rect = { left: number; top: number; right: number; bottom: number };

/** The slide (0-based) a rect starts in. */
export const slideOf = (r: Rect): number => Math.floor(r.left / SLIDE_W);

/** Why a text rect breaks the safe-area rule, or null if it is fine. */
export const textViolation = (r: Rect, declaredSlide: number): string | null => {
  const s = slideOf(r);
  if (s !== declaredSlide) return `belongs to slide ${declaredSlide + 1} but starts in slide ${s + 1}`;
  const x0 = slideX(s) + TEXT_SAFE;
  const x1 = slideX(s + 1) - TEXT_SAFE;
  if (r.left < x0) return `${Math.round(x0 - r.left)}px inside the left safe area`;
  if (r.right > x1) return `${Math.round(r.right - x1)}px inside the right safe area (or crosses a join)`;
  if (r.top < TEXT_SAFE) return `${Math.round(TEXT_SAFE - r.top)}px inside the top safe area`;
  if (r.bottom > SLIDE_H - TEXT_SAFE)
    return `${Math.round(r.bottom - (SLIDE_H - TEXT_SAFE))}px inside the bottom safe area`;
  return null;
};

/** True when `r` reaches at least CROSS_REACH px into both sides of join `x`. */
export const crossesJoin = (r: Rect, x: number): boolean =>
  r.left <= x - CROSS_REACH && r.right >= x + CROSS_REACH;

export const intersects = (a: Rect, b: Rect, pad = 0): boolean =>
  a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad;

/** Mulberry32: seeded PRNG so the skyline is identical on every render. */
export const seeded = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Smooth path through points (Catmull-Rom converted to cubic Bezier). */
export const smoothPath = (pts: [number, number][]): string => {
  if (pts.length < 2) throw new Error("smoothPath needs at least two points");
  const f = (n: number) => Math.round(n * 10) / 10;
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d;
};
