/**
 * Deterministic timeline for the Nigeria 2.0 X video.
 *
 * Every frame is a pure function of its index: camera position, per-slide
 * text reveal, thread draw, stat count-up and decoration motion all come
 * from `stateAt(frame, format)`. No wall clock, no randomness.
 *
 * The camera rests on "stops" and eases between them across the seamless
 * joins. Each stop frames whole slides plus at most 60px of a neighbour.
 * The carousel keeps all text 60px inside each slide, so no text is ever cut
 * by the frame edge while the camera rests.
 */
import { PANORAMA_W, SLIDE_COUNT, SLIDE_H, SLIDE_W, TEXT_SAFE } from "../summit-carousel/layout";

export const FPS = 30;
/** Seconds for each pan between stops. */
export const PAN = 0.9;
/** Text on a slide starts revealing this long before the camera lands. */
export const REVEAL_LEAD = 0.35;
/** Extra delay for the second slide of a two-slide stop. */
export const PAIR_DELAY = 0.6;
/** Stagger between text blocks inside a slide. */
export const STAGGER = 0.09;
/** Duration of one block's fade-and-rise. */
export const BLOCK_IN = 0.55;
/** Stat count-up length on slide 3. */
export const COUNT_UP = 1.3;

export type Stop = { x: number; slides: number[]; hold: number };

export type Format = {
  id: "x-4x5" | "x-16x9";
  width: number;
  height: number;
  /** Panorama px -> output px. */
  scale: number;
  /** Panorama y shown at the top of the frame. */
  y: number;
  stops: Stop[];
};

/** Seconds the 4:5 camera rests on each slide, tuned to reading load. */
export const HOLDS_4X5 = [3.4, 4.2, 4.0, 3.8, 4.4, 4.2, 4.8];

/** 16:9 view: two slides plus 60px of each neighbour. */
const VIEW_16X9 = 2 * SLIDE_W + 2 * TEXT_SAFE;
const SCALE_16X9 = 1920 / VIEW_16X9;

export const FORMATS: Record<Format["id"], Format> = {
  "x-4x5": {
    id: "x-4x5",
    width: SLIDE_W,
    height: SLIDE_H,
    scale: 1,
    y: 0,
    stops: HOLDS_4X5.map((hold, i) => ({ x: i * SLIDE_W, slides: [i], hold })),
  },
  "x-16x9": {
    id: "x-16x9",
    width: 1920,
    height: 1080,
    scale: SCALE_16X9,
    // Crop mostly from the skyline at the bottom, keep the top margin.
    y: 12,
    stops: [
      { x: -TEXT_SAFE, slides: [0, 1], hold: 7.0 },
      { x: 2 * SLIDE_W - TEXT_SAFE, slides: [2, 3], hold: 7.4 },
      { x: 4 * SLIDE_W - TEXT_SAFE, slides: [4, 5], hold: 8.2 },
      { x: 5 * SLIDE_W - TEXT_SAFE, slides: [5, 6], hold: 5.4 },
    ],
  },
};

/** Visible panorama size for a format, in panorama px. */
export const viewWidth = (f: Format): number => f.width / f.scale;
export const viewHeight = (f: Format): number => f.height / f.scale;

export type Segment = { kind: "hold" | "pan"; stop: number; start: number; end: number };

/** Hold, pan, hold, pan ... hold. `stop` is the stop held, or the stop being left. */
export const segments = (f: Format): Segment[] => {
  const out: Segment[] = [];
  let t = 0;
  f.stops.forEach((s, i) => {
    out.push({ kind: "hold", stop: i, start: t, end: t + s.hold });
    t += s.hold;
    if (i < f.stops.length - 1) {
      out.push({ kind: "pan", stop: i, start: t, end: t + PAN });
      t += PAN;
    }
  });
  return out;
};

export const duration = (f: Format): number => segments(f).at(-1)!.end;
export const frameCount = (f: Format): number => Math.round(duration(f) * FPS);

/** Time the camera lands on the first stop that shows slide i. */
export const arrival = (f: Format, i: number): number => {
  const stop = f.stops.findIndex((s) => s.slides.includes(i));
  if (stop < 0) throw new Error(`slide ${i + 1} is never shown in ${f.id}`);
  return segments(f).find((s) => s.kind === "hold" && s.stop === stop)!.start;
};

/** When slide i's text begins to appear. The cover starts part-revealed so frame 0 is a usable thumbnail. */
export const revealStart = (f: Format, i: number): number => {
  if (i === 0) return -0.45;
  const stop = f.stops.find((s) => s.slides.includes(i))!;
  const second = stop.slides.indexOf(i) === 1 ? PAIR_DELAY : 0;
  return arrival(f, i) - REVEAL_LEAD + second;
};

const lastStopStart = (f: Format): number => segments(f).at(-1)!.start;

export const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
export const easeInOutCubic = (x: number): number =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const easeOutCubic = (x: number): number => 1 - Math.pow(1 - x, 3);

export const cameraX = (t: number, f: Format): number => {
  const segs = segments(f);
  for (const s of segs) {
    if (t < s.end || s === segs.at(-1)) {
      if (s.kind === "hold") return f.stops[s.stop].x;
      const p = easeInOutCubic(clamp01((t - s.start) / (s.end - s.start)));
      const a = f.stops[s.stop].x;
      const b = f.stops[s.stop + 1].x;
      return a + (b - a) * p;
    }
  }
  return f.stops.at(-1)!.x;
};

/** Opacity/offset progress (0..1) of block `b` on slide `i` at time t. */
export const blockProgress = (f: Format, t: number, i: number, b: number): number =>
  easeOutCubic(clamp01((t - revealStart(f, i) - b * STAGGER) / BLOCK_IN));

export type FrameState = {
  frame: number;
  t: number;
  cameraX: number;
  cameraY: number;
  /** Thread drawn up to this panorama x. */
  threadX: number;
  /** 0..1 stat count-up. */
  count: number;
  /** 0..1 growth of the bars across join 6|7. */
  bars: number;
  /** Orbit rotation in degrees. */
  orbit: number;
  /** 0..1 fade to navy at the very end (for a clean loop). */
  fadeOut: number;
};

export const stateAt = (frame: number, f: Format): FrameState => {
  const t = frame / FPS;
  const cx = cameraX(t, f);
  const d = duration(f);
  return {
    frame,
    t,
    cameraX: cx,
    cameraY: f.y,
    // The line leads the camera, so it is always drawing into the next slide,
    // then completes (arrowhead and all) once the camera reaches the last stop.
    threadX: Math.min(
      PANORAMA_W,
      cx + viewWidth(f) * 0.82 + 40 * Math.sin(t * 1.3) + PANORAMA_W * clamp01((t - lastStopStart(f)) / 1.4),
    ),
    count: easeOutCubic(clamp01((t - revealStart(f, 2) - 0.5) / COUNT_UP)),
    bars: easeOutCubic(clamp01((t - revealStart(f, 5) - 0.6) / 1.1)),
    orbit: t * 9,
    fadeOut: clamp01((t - (d - 0.45)) / 0.45),
  };
};

/** Panorama rects of every slide fully or partly in view while resting on a stop. */
export const visibleSlices = (f: Format, stop: Stop) => {
  const vw = viewWidth(f);
  return Array.from({ length: SLIDE_COUNT }, (_, i) => {
    const left = Math.max(stop.x, i * SLIDE_W);
    const right = Math.min(stop.x + vw, (i + 1) * SLIDE_W);
    return { slide: i, visible: Math.max(0, right - left), left, right };
  }).filter((s) => s.visible > 0);
};

/** "$50M+" at progress p -> "$23M+". Keeps prefix, suffix and thousands separators. */
export const countText = (final: string, p: number): string => {
  const m = /^(\D*)([\d,]+)(.*)$/.exec(final);
  if (!m) return final;
  const target = Number(m[2].replace(/,/g, ""));
  const n = Math.round(target * clamp01(p));
  const body = m[2].includes(",") ? n.toLocaleString("en-US") : String(n);
  return `${m[1]}${body}${m[3]}`;
};
