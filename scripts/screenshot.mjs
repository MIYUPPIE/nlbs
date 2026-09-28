#!/usr/bin/env node
/**
 * Visual check helper. Captures a page at a given width and reports
 * horizontal overflow and console errors.
 *
 *   node scripts/screenshot.mjs <path> <width> <outFile.png> [--full | --segments] [--base=http://localhost:3000]
 *
 * --segments writes <outFile>-01.png, -02.png ... one per 1600px slice.
 */
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const [path = "/", width = "1440", out = "screenshot.png"] = args.filter((a) => !a.startsWith("--"));
const base = flags.base ?? "http://localhost:3000";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(e.message));

await page.goto(base + path, { waitUntil: "networkidle" });
// Wheel-scroll through the page so reveal-on-scroll content is visible.
const total = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < total; y += 400) {
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(40);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1800);
if ("segments" in flags) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const slice = 1600;
  for (let i = 0, y = 0; y < height; i++, y += slice) {
    await page.screenshot({
      path: out.replace(/\.png$/, `-${String(i + 1).padStart(2, "0")}.png`),
      fullPage: true,
      clip: { x: 0, y, width: Number(width), height: Math.min(slice, height - y) },
    });
  }
} else {
  await page.screenshot({ path: out, fullPage: "full" in flags });
}
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);
console.log(
  `${path} @${width}px overflow=${overflow}px errors=${errors.length ? JSON.stringify(errors) : "none"}`,
);
await browser.close();
