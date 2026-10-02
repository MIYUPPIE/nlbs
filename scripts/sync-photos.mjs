#!/usr/bin/env node
/**
 * Syncs real, freely licensed photographs into the site.
 *
 *   node scripts/sync-photos.mjs        (npm run photos:sync)
 *
 * Reads content/photos.json, asks Wikimedia Commons for each file's licence,
 * author and a resized copy, then writes:
 *   public/photos/<id>.webp          resized, metadata stripped (no EXIF/GPS)
 *   src/data/photos.generated.json   attribution the site renders as credits
 *
 * Licence and credit are never typed by hand: they come from Commons, and a
 * file whose licence is not on the allowlist fails the sync. Rerun after
 * editing the manifest; the output is deterministic for the same upstream file.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = join(ROOT, "content", "photos.json");
const OUT_DIR = join(ROOT, "public", "photos");
const OUT_DATA = join(ROOT, "src", "data", "photos.generated.json");
const API = "https://commons.wikimedia.org/w/api.php";
const UA = "nlbs-site-photo-sync/1.0 (https://nlbs.com.ng; info@nlbs.com.ng)";

/** Licences that allow commercial reuse with attribution. Keep in sync with tests/photos.test.ts. */
export const ALLOWED_LICENCES = /^(CC0|Public domain|CC BY(-SA)? [1-4]\.0)$/;

export const stripHtml = (s) =>
  s
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

/** First href in Commons' Artist HTML, made absolute. */
export const firstHref = (html) => {
  const m = /href="([^"]+)"/.exec(html ?? "");
  if (!m) return null;
  return m[1].startsWith("//") ? `https:${m[1]}` : m[1];
};

async function getJson(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", ...params })}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Commons API ${res.status} for ${url}`);
  return res.json();
}

async function syncOne(entry) {
  if (!/^[a-z0-9-]+$/.test(entry.id)) throw new Error(`Bad id "${entry.id}"`);
  if (!entry.commons?.startsWith("File:")) throw new Error(`${entry.id}: "commons" must be a File: title`);
  if (!entry.alt?.trim() || !entry.caption?.trim())
    throw new Error(`${entry.id}: alt and caption are required`);

  const data = await getJson({
    action: "query",
    prop: "imageinfo",
    titles: entry.commons,
    iiprop: "url|size|extmetadata",
    iiurlwidth: String(entry.width ?? 1600),
  });
  const page = Object.values(data.query.pages)[0];
  const info = page.imageinfo?.[0];
  if (!info) throw new Error(`${entry.id}: ${entry.commons} not found on Commons`);
  const meta = info.extmetadata;
  const licence = meta.LicenseShortName?.value ?? "";
  if (!ALLOWED_LICENCES.test(licence)) throw new Error(`${entry.id}: licence "${licence}" is not allowed`);

  const img = await fetch(info.thumburl, { headers: { "User-Agent": UA } });
  if (!img.ok) throw new Error(`${entry.id}: download ${img.status}`);
  const { data: webp, info: out } = await sharp(Buffer.from(await img.arrayBuffer()))
    .rotate()
    .resize({ width: entry.width ?? 1600, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toBuffer({ resolveWithObject: true });
  await writeFile(join(OUT_DIR, `${entry.id}.webp`), webp);

  return {
    id: entry.id,
    src: `/photos/${entry.id}.webp`,
    width: out.width,
    height: out.height,
    alt: entry.alt,
    caption: entry.caption,
    author: stripHtml(meta.Artist?.value ?? "") || "Unknown author",
    authorUrl: firstHref(meta.Artist?.value),
    licence,
    licenceUrl: meta.LicenseUrl?.value ?? null,
    sourceUrl: info.descriptionurl,
    title: page.title,
  };
}

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
  await mkdir(OUT_DIR, { recursive: true });
  const photos = [];
  for (const entry of manifest.photos) {
    const p = await syncOne(entry);
    console.log(`photos: ${p.id} ${p.width}x${p.height} ${p.licence} by ${p.author}`);
    photos.push(p);
  }
  await writeFile(OUT_DATA, `${JSON.stringify({ photos }, null, 2)}\n`);
  console.log(`photos: wrote ${photos.length} to public/photos and ${OUT_DATA.replace(ROOT + "/", "")}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(`photos: ${e.message}`);
    process.exit(1);
  });
}
