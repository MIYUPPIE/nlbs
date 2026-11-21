/**
 * Gate tests for the Nigeria 2.0 X video (social/summit-video).
 * Pure timeline and audio-graph checks. The full render, ffprobe
 * verification and loudness check run in `npm run video:render`.
 */
import { describe, expect, it } from "vitest";
import { carousel, forX } from "../social/summit-carousel/content";
import { buildHtml } from "../social/summit-carousel/html";
import { PANORAMA_W, SLIDE_COUNT, SLIDE_H, SLIDE_W, TEXT_SAFE } from "../social/summit-carousel/layout";
import {
  chimeAt,
  loudnormFilter,
  parseLoudnorm,
  rawMixArgs,
  whooshEnvelope,
} from "../social/summit-video/audio";
import {
  FORMATS,
  FPS,
  PAN,
  arrival,
  blockProgress,
  cameraX,
  countText,
  duration,
  frameCount,
  revealStart,
  segments,
  stateAt,
  viewHeight,
  viewWidth,
  visibleSlices,
} from "../social/summit-video/timeline";

const formats = Object.values(FORMATS);

describe.each(formats)("timeline $id", (f) => {
  it("shows every slide, in order, at least once", () => {
    const shown = f.stops.flatMap((s) => s.slides);
    expect([...new Set(shown)]).toEqual(Array.from({ length: SLIDE_COUNT }, (_, i) => i));
    for (let i = 1; i < SLIDE_COUNT; i++) expect(arrival(f, i)).toBeGreaterThanOrEqual(arrival(f, i - 1));
  });

  it("never cuts text with the frame edge while resting: slides are whole or show <= 60px", () => {
    for (const stop of f.stops)
      for (const s of visibleSlices(f, stop)) {
        const whole = s.visible >= SLIDE_W - 0.5;
        expect(whole || s.visible <= TEXT_SAFE + 0.5, `${f.id} stop x=${stop.x} slide ${s.slide + 1}`).toBe(
          true,
        );
        if (whole) expect(stop.slides).toContain(s.slide);
      }
  });

  it("frame covers the panorama height except a small crop", () => {
    expect(viewHeight(f)).toBeLessThanOrEqual(SLIDE_H);
    expect(f.y).toBeGreaterThanOrEqual(0);
    expect(f.y + viewHeight(f)).toBeLessThanOrEqual(SLIDE_H);
    // Top text sits at y >= 60, so at least 40px of the top margin must survive.
    expect(TEXT_SAFE - f.y).toBeGreaterThanOrEqual(40);
  });

  it("segments alternate hold/pan with no gaps", () => {
    const segs = segments(f);
    expect(segs[0]).toMatchObject({ kind: "hold", start: 0 });
    segs.forEach((s, i) => {
      expect(s.kind).toBe(i % 2 === 0 ? "hold" : "pan");
      if (i > 0) expect(s.start).toBeCloseTo(segs[i - 1].end);
      if (s.kind === "pan") expect(s.end - s.start).toBeCloseTo(PAN);
    });
    expect(frameCount(f)).toBe(Math.round(duration(f) * FPS));
  });

  it("camera rests exactly on each stop, and pans monotonically", () => {
    for (const s of segments(f).filter((x) => x.kind === "hold")) {
      expect(cameraX(s.start, f)).toBeCloseTo(f.stops[s.stop].x);
      expect(cameraX(s.end - 0.001, f)).toBeCloseTo(f.stops[s.stop].x);
    }
    let prev = -Infinity;
    for (let fr = 0; fr < frameCount(f); fr++) {
      const x = cameraX(fr / FPS, f);
      expect(x).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = x;
    }
    expect(cameraX(0, f)).toBe(f.stops[0].x);
    expect(cameraX(duration(f), f)).toBe(f.stops.at(-1)!.x);
  });

  it("frame 0 is a usable thumbnail: the cover's first blocks are already visible", () => {
    expect(blockProgress(f, 0, 0, 0)).toBeGreaterThan(0.6);
    expect(blockProgress(f, 0, 0, 1)).toBeGreaterThan(0.4);
  });

  it("every slide's text is fully revealed before the camera leaves it", () => {
    for (let i = 0; i < SLIDE_COUNT; i++) {
      const stopIdx = f.stops.findIndex((s) => s.slides.includes(i));
      const leave = segments(f).find((s) => s.kind === "hold" && s.stop === stopIdx)!.end;
      expect(blockProgress(f, leave - 0.5, i, 7)).toBeCloseTo(1, 5);
    }
  });

  it("thread leads the camera and finishes before the end", () => {
    expect(stateAt(0, f).threadX).toBeGreaterThan(0);
    expect(stateAt(frameCount(f) - 1, f).threadX).toBe(PANORAMA_W);
  });

  it("stats count up after slide 3 reveals and land on the real figures", () => {
    expect(stateAt(Math.floor(revealStart(f, 2) * FPS), f).count).toBe(0);
    const end = stateAt(frameCount(f) - 1, f);
    expect(end.count).toBe(1);
    expect(end.fadeOut).toBeGreaterThan(0.9);
    expect(stateAt(0, f).fadeOut).toBe(0);
  });

  it("is within X's limits (<= 2:20, <= 1920x1200)", () => {
    expect(duration(f)).toBeLessThan(140);
    expect(f.width).toBeLessThanOrEqual(1920);
    expect(Math.max(f.width, f.height)).toBeLessThanOrEqual(1920);
  });

  it("audio graph has one whoosh per pan and a chime at the closing slide", () => {
    expect(whooshEnvelope(f).match(/between\(/g)).toHaveLength(f.stops.length - 1);
    expect(chimeAt(f)).toBeCloseTo(arrival(f, 6) - 0.05);
    const args = rawMixArgs(f, "/tmp/x.wav");
    expect(args).toContain("-filter_complex");
    expect(args.join(" ")).toContain("seed=2026");
    expect(args.join(" ")).toContain(`d=${duration(f).toFixed(3)}`);
  });
});

describe("timeline specifics", () => {
  it("4:5 is one slide per frame at 1x, 16:9 frames two slides plus 60px each side", () => {
    expect(viewWidth(FORMATS["x-4x5"])).toBe(SLIDE_W);
    expect(viewWidth(FORMATS["x-16x9"])).toBeCloseTo(2 * SLIDE_W + 2 * TEXT_SAFE);
    expect(FORMATS["x-16x9"].height).toBe(1080);
  });

  it("countText keeps prefix, suffix and separators", () => {
    expect(countText("$50M+", 0)).toBe("$0M+");
    expect(countText("$50M+", 0.5)).toBe("$25M+");
    expect(countText("10,000", 0.5)).toBe("5,000");
    expect(countText("10,000", 1)).toBe("10,000");
    expect(countText("800+", 1)).toBe("800+");
    expect(countText("n/a", 0.3)).toBe("n/a");
  });
});

describe("audio helpers", () => {
  it("parses the loudnorm JSON block from ffmpeg stderr", () => {
    const stderr =
      'junk\n[Parsed_loudnorm_0 @ 0x1]\n{\n "input_i" : "-20.1",\n "input_tp" : "-4.0",\n "input_lra" : "3.0",\n "input_thresh" : "-30.2",\n "target_offset" : "0.1"\n}\n';
    const m = parseLoudnorm(stderr);
    expect(m.input_i).toBe("-20.1");
    expect(loudnormFilter(m)).toContain("measured_I=-20.1");
    expect(loudnormFilter()).toContain("I=-14");
    expect(() => parseLoudnorm("nothing")).toThrow();
  });
});

describe("X copy variant", () => {
  it("swaps Instagram verbs for X's and drops Swipe", () => {
    const x = forX();
    expect(x.cta.save).toBe("Bookmark");
    expect(x.cta.share).toBe("Repost");
    expect(x.cover.swipe).toBe("");
    expect(carousel.cta.save).toBe("Save");
    const html = buildHtml(
      x,
      (p) => p,
      (p) => p,
    );
    expect(html).not.toContain('class="swipe"');
    expect(html).toContain("Repost");
  });
});
