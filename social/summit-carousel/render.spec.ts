/**
 * Renders the carousel and enforces the seamless rules on the real layout.
 *
 *   npm run carousel:render
 *
 * Writes social/summit-carousel/out/: panorama.jpg, slide_1.jpg .. slide_7.jpg,
 * panorama.html and report.json. Fails (after writing the images, so you can
 * look) if any rule breaks:
 *   - every glyph and logo sits >= 60px inside its own slide (text never crosses a join)
 *   - every join has at least one crossing element besides the thread
 *   - crossing elements never touch text (ghost layer excepted, kept faint)
 *   - one thread spans the full panorama
 *   - fonts and images all loaded
 *   - the background is continuous at every join (pixel seam check)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";
import sharp from "sharp";
import { carousel } from "./content";
import { buildHtml } from "./html";
import {
  PANORAMA_W,
  SLIDE_COUNT,
  SLIDE_H,
  SLIDE_W,
  crossesJoin,
  intersects,
  joins,
  textViolation,
  type Rect,
} from "./layout";

const HERE = __dirname;
const ROOT = join(HERE, "..", "..");
const OUT = join(HERE, "out");
const fileUrl = (p: string) => pathToFileURL(p).href;

/** Mean absolute RGB difference allowed between the two pixel columns at a join. */
const SEAM_MAX = 10;

test("render the Nigeria 2.0 seamless carousel", async ({ page }) => {
  mkdirSync(OUT, { recursive: true });
  const html = buildHtml(
    carousel,
    (p) => fileUrl(join(ROOT, "public", p)),
    (f) => fileUrl(join(HERE, "fonts", f)),
  );
  const htmlPath = join(OUT, "panorama.html");
  writeFileSync(htmlPath, html);

  await page.setViewportSize({ width: PANORAMA_W, height: SLIDE_H });
  await page.goto(fileUrl(htmlPath));
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

  // Render and cut.
  const png = await page.screenshot({
    clip: { x: 0, y: 0, width: PANORAMA_W, height: SLIDE_H },
    type: "png",
  });
  const jpg = { quality: 93, chromaSubsampling: "4:4:4", mozjpeg: true } as const;
  await sharp(png).jpeg(jpg).toFile(join(OUT, "panorama.jpg"));
  for (let i = 0; i < SLIDE_COUNT; i++) {
    await sharp(png)
      .extract({ left: i * SLIDE_W, top: 0, width: SLIDE_W, height: SLIDE_H })
      .jpeg(jpg)
      .toFile(join(OUT, `slide_${i + 1}.jpg`));
  }

  // Seam check: the last column of slide i vs the first column of slide i+1.
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const seams = joins().map((x) => {
    let sum = 0;
    for (let y = 0; y < info.height; y++)
      for (let ch = 0; ch < 3; ch++) {
        const a = data[(y * info.width + x - 1) * 3 + ch];
        const b = data[(y * info.width + x) * 3 + ch];
        sum += Math.abs(a - b);
      }
    const mean = sum / (info.height * 3);
    if (mean > SEAM_MAX)
      errors.push(`visible seam at x=${x}: mean column diff ${mean.toFixed(2)} > ${SEAM_MAX}`);
    return { x, meanDiff: Number(mean.toFixed(3)) };
  });

  for (let i = 0; i < SLIDE_COUNT; i++) {
    const meta = await sharp(join(OUT, `slide_${i + 1}.jpg`)).metadata();
    if (meta.width !== SLIDE_W || meta.height !== SLIDE_H)
      errors.push(`slide_${i + 1}.jpg is ${meta.width}x${meta.height}`);
  }

  const report = {
    renderedAt: new Date().toISOString(),
    size: { panorama: [PANORAMA_W, SLIDE_H], slide: [SLIDE_W, SLIDE_H], slides: SLIDE_COUNT },
    textRuns: m.texts.length,
    joins: joinReport,
    thread: m.thread,
    seams,
    errors,
  };
  writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));

  expect(errors).toEqual([]);
});
