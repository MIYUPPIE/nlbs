#!/usr/bin/env node
/**
 * Converts a generated image into a site illustration.
 *
 *   node scripts/add-illustration.mjs <source.png> <id> [width=1600]
 *
 * Writes public/illustrations/<id>.webp (resized, metadata stripped) and
 * prints the width and height to record in src/data/illustrations.ts, where
 * every illustration must also be described and disclosed as AI-generated.
 */
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const [src, id, width = "1600"] = process.argv.slice(2);
if (!src || !/^[a-z0-9-]+$/.test(id ?? "")) {
  console.error("usage: node scripts/add-illustration.mjs <source.png> <id> [width]");
  process.exit(1);
}
const outDir = join(ROOT, "public", "illustrations");
await mkdir(outDir, { recursive: true });
const out = join(outDir, `${id}.webp`);
const info = await sharp(src)
  .rotate()
  .resize({ width: Number(width), withoutEnlargement: true })
  .webp({ quality: 74 })
  .toFile(out);
console.log(
  `${id}: ${info.width}x${info.height} ${Math.round(info.size / 1024)} KB -> public/illustrations/${id}.webp`,
);
