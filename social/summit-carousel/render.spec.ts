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
import { checkLayout } from "./checks";
import { buildHtml } from "./html";
import { PANORAMA_W, SLIDE_COUNT, SLIDE_H, SLIDE_W, joins } from "./layout";

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
  const { errors, joinReport, thread, textRuns } = await checkLayout(page);

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
    textRuns,
    joins: joinReport,
    thread,
    seams,
    errors,
  };
  writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));

  expect(errors).toEqual([]);
});
