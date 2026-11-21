/**
 * Layout rules for the seamless carousel, measured on the real page.
 * Shared by the carousel render and the X video render.
 */
import type { Page } from "@playwright/test";
import {
  PANORAMA_W,
  SLIDE_COUNT,
  SLIDE_W,
  crossesJoin,
  intersects,
  joins,
  textViolation,
  type Rect,
} from "./layout";

/** Load fonts, then measure every glyph, logo, crosser and the thread. Page must show the whole panorama untransformed. */
export const checkLayout = async (page: Page) => {
  await page.evaluate(() => document.fonts.ready);
  const m = await page.evaluate(() => {
    const box = (r: DOMRect) => ({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });
    const texts: { slide: number; text: string; rect: ReturnType<typeof box> }[] = [];
    document.querySelectorAll<HTMLElement>("section[data-slide]").forEach((sec) => {
      const slide = Number(sec.dataset.slide);
      const walker = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const t = n.textContent ?? "";
        if (!t.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(n);
        for (const r of Array.from(range.getClientRects())) {
          if (r.width > 0 && r.height > 0) texts.push({ slide, text: t.trim().slice(0, 60), rect: box(r) });
        }
      }
      sec
        .querySelectorAll<HTMLImageElement>("img[data-textlike]")
        .forEach((img) =>
          texts.push({ slide, text: `[logo] ${img.alt}`, rect: box(img.getBoundingClientRect()) }),
        );
    });
    const crossers = Array.from(document.querySelectorAll<HTMLElement>("[data-cross]")).map((el) => ({
      name: el.dataset.cross ?? "",
      layer: el.dataset.layer ?? "front",
      opacity: Number(getComputedStyle(el).opacity),
      rect: box(el.getBoundingClientRect()),
    }));
    const threads = Array.from(document.querySelectorAll("#threadPath")) as SVGPathElement[];
    const tb = threads[0]?.getBBox();
    const images = Array.from(document.images).map((i) => ({
      src: i.src,
      ok: i.complete && i.naturalWidth > 0,
    }));
    const fonts = {
      geist: document.fonts.check('800 40px "Geist"'),
      serif: document.fonts.check('40px "Instrument Serif"'),
    };
    return {
      texts,
      crossers,
      threadCount: threads.length,
      thread: tb ? { left: tb.x, right: tb.x + tb.width, length: threads[0].getTotalLength() } : null,
      images,
      fonts,
    };
  });

  const errors: string[] = [];

  if (!m.fonts.geist || !m.fonts.serif) errors.push(`fonts not loaded: ${JSON.stringify(m.fonts)}`);
  for (const img of m.images) if (!img.ok) errors.push(`image failed to load: ${img.src}`);

  // Rule: text never crosses a join, and keeps 60px from every slide edge.
  for (const t of m.texts) {
    const v = textViolation(t.rect, t.slide);
    if (v) errors.push(`slide ${t.slide + 1} text "${t.text}" ${v}`);
  }

  // Rule: every join has a crossing element (stricter than "every other").
  const front = m.crossers.filter((c) => c.layer === "front");
  const joinReport = joins().map((x, i) => {
    const names = m.crossers.filter((c) => crossesJoin(c.rect, x)).map((c) => c.name);
    if (names.length === 0) errors.push(`join ${i + 1}|${i + 2} has no crossing element`);
    return { join: `${i + 1}|${i + 2}`, x, crossers: names };
  });

  // Crossers in front of the background must not touch text.
  const PAD = 12;
  for (const c of front)
    for (const t of m.texts)
      if (intersects(c.rect as Rect, t.rect, PAD))
        errors.push(`crosser "${c.name}" touches slide ${t.slide + 1} text "${t.text}"`);

  // The ghost layer sits behind text, so it must stay faint.
  for (const c of m.crossers.filter((x) => x.layer === "ghost"))
    if (c.opacity > 0.2) errors.push(`ghost "${c.name}" opacity ${c.opacity} > 0.2`);

  // Rule: one continuous thread across all slides.
  if (m.threadCount !== 1) errors.push(`expected exactly one thread path, found ${m.threadCount}`);
  if (!m.thread || m.thread.left > 0 || m.thread.right < PANORAMA_W - SLIDE_W)
    errors.push(`thread does not span the panorama: ${JSON.stringify(m.thread)}`);
  else if (m.thread.right < (SLIDE_COUNT - 1) * SLIDE_W + SLIDE_W / 2)
    errors.push("thread stops before the middle of the last slide");

  return { errors, joinReport, thread: m.thread, textRuns: m.texts.length };
};
