/**
 * Guards the real-photo pipeline (content/photos.json -> scripts/sync-photos.mjs
 * -> public/photos + src/data/photos.generated.json). Photos must be real,
 * licensed for reuse, credited wherever they render, and never presented as
 * pictures of the summit or its 2025 edition.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { photo, photos } from "@/data/photos";
import { ALLOWED_LICENCES, firstHref, stripHtml } from "../scripts/sync-photos.mjs";

const ROOT = join(__dirname, "..");
const manifest = JSON.parse(readFileSync(join(ROOT, "content", "photos.json"), "utf8")) as {
  photos: { id: string; commons: string; alt: string; caption: string }[];
};
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.tsx$/.test(p) ? [p] : [];
  });

describe("photo manifest and synced output", () => {
  it("generated data matches the manifest one to one", () => {
    expect(photos.map((p) => p.id)).toEqual(manifest.photos.map((p) => p.id));
    for (const [i, m] of manifest.photos.entries()) {
      expect(photos[i].title).toBe(m.commons);
      expect(photos[i].alt).toBe(m.alt);
      expect(photos[i].caption).toBe(m.caption);
    }
  });

  it("every photo is a Commons file under an allowed licence with a named author", () => {
    for (const p of photos) {
      expect(p.licence).toMatch(ALLOWED_LICENCES);
      expect(p.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(p.author.trim()).not.toBe("");
      expect(p.author).not.toMatch(/[<>]/);
      if (p.licence.startsWith("CC BY")) expect(p.licenceUrl).toMatch(/^https:\/\/creativecommons\.org\//);
    }
  });

  it("files exist, match recorded dimensions, stay under 500 KB and carry no EXIF/GPS", async () => {
    for (const p of photos) {
      const file = join(ROOT, "public", p.src);
      expect(existsSync(file), p.src).toBe(true);
      expect(statSync(file).size).toBeLessThan(500 * 1024);
      const meta = await sharp(file).metadata();
      expect(meta.format).toBe("webp");
      expect([meta.width, meta.height]).toEqual([p.width, p.height]);
      expect(meta.exif).toBeUndefined();
    }
  });

  it("photo() throws for an id that was never synced", () => {
    expect(() => photo("nope" as never)).toThrow(/photos:sync/);
  });
});

describe("content rule: venue photos are not event photos", () => {
  it("no alt text or caption claims to show the summit, delegates or a past edition", () => {
    for (const p of photos) {
      expect(`${p.alt} ${p.caption}`).not.toMatch(
        /\b(20(1|2)\d|summit|edition|delegates?|attendees?|speakers?|panel)\b/i,
      );
    }
  });

  it("the 2025 edition section renders no photos until real event photos exist", () => {
    const src = readFileSync(join(ROOT, "src/components/sections/EditionSection.tsx"), "utf8");
    expect(src).not.toMatch(/@\/data\/photos|<Image/);
  });

  it("every component that renders a synced photo also renders its credit", () => {
    const users = walk(join(ROOT, "src")).filter((f) =>
      /from "@\/data\/photos"/.test(readFileSync(f, "utf8")),
    );
    expect(users.length).toBeGreaterThanOrEqual(4);
    for (const f of users) {
      const src = readFileSync(f, "utf8");
      if (/\bphoto\(/.test(src)) expect(src, f).toMatch(/<PhotoCredit\b/);
    }
  });
});

describe("sync script helpers", () => {
  it("allowlist accepts reusable licences and rejects the rest", () => {
    for (const ok of ["CC BY-SA 4.0", "CC BY 2.0", "CC0", "Public domain"])
      expect(ok).toMatch(ALLOWED_LICENCES);
    for (const bad of ["CC BY-NC 4.0", "CC BY-ND 4.0", "All rights reserved", "Fair use", ""])
      expect(bad).not.toMatch(ALLOWED_LICENCES);
  });

  it("strips Commons artist HTML to plain text and extracts the first link", () => {
    const html = '<a href="//commons.wikimedia.org/wiki/User:A_B" title="User:A B">A &amp; B</a>\n';
    expect(stripHtml(html)).toBe("A & B");
    expect(firstHref(html)).toBe("https://commons.wikimedia.org/wiki/User:A_B");
    expect(firstHref("Unknown author")).toBeNull();
  });
});
