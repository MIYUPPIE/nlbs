/**
 * Speakers, guests of honour and flyer partners (convener, Nov 2026).
 * Guards the photos (real files, correct size, 4:5, no metadata), the data
 * (every field from a supplied source), and the logos.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { displayName, speakerGroups, speakers, speakersIn } from "@/data/speakers";
import { partnerCategories } from "@/data/partners";
import { eventJsonLd } from "@/lib/site";

const PUBLIC = join(process.cwd(), "public");

describe("speaker portraits", () => {
  it.each(speakers)("$name has a 4:5 WebP of the declared size with no metadata", async (s) => {
    const file = join(PUBLIC, s.photo.src);
    expect(existsSync(file)).toBe(true);
    expect(s.photo.src).toMatch(/\.webp$/);
    const meta = await sharp(file).metadata();
    expect([meta.width, meta.height]).toEqual([s.photo.width, s.photo.height]);
    expect(s.photo.width / s.photo.height).toBeCloseTo(0.8, 2);
    expect(meta.exif).toBeUndefined();
    expect(meta.size ?? 0).toBeLessThan(120_000);
  });

  it("are never upscaled past 640x800", () => {
    for (const s of speakers) expect(s.photo.width).toBeLessThanOrEqual(640);
  });

  it("every published portrait in public/speakers is used, and has its original in assets-src", () => {
    const files = readdirSync(join(PUBLIC, "speakers"));
    const used = new Set(speakers.map((s) => s.photo.src.replace("/speakers/", "")));
    expect(files.filter((f) => !used.has(f))).toEqual([]);
    for (const f of files) {
      expect(existsSync(join(process.cwd(), "assets-src/speakers", f.replace(".webp", ".jpeg")))).toBe(true);
    }
  });

  it("the Oduwole crop skips the source's white top strip", async () => {
    const { data } = await sharp(join(PUBLIC, "speakers/jumoke-oduwole.webp"))
      .extract({ left: 0, top: 0, width: 420, height: 1 })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    expect(mean).toBeLessThan(240);
  });
});

describe("speaker data", () => {
  it("has unique ids", () => {
    expect(new Set(speakers.map((s) => s.id)).size).toBe(speakers.length);
  });

  it("puts every speaker in exactly one display group, in flyer order", () => {
    expect(speakerGroups.map((g) => g.category)).toEqual([
      "Chief Host",
      "Keynote",
      "Special Guest of Honour",
      "Special Invited Guest of Honour",
      "Patron",
      "Speaker",
    ]);
    expect(speakerGroups.flatMap((g) => speakersIn(g.category)).length).toBe(speakers.length);
    for (const g of speakerGroups) expect(speakersIn(g.category).length).toBeGreaterThan(0);
  });

  it("matches the flyer's roles", () => {
    const by = Object.fromEntries(speakers.map((s) => [s.id, s]));
    expect(by["babajide-sanwo-olu"].category).toBe("Chief Host");
    expect(displayName(by["babajide-sanwo-olu"])).toBe("His Excellency Babajide Sanwo-Olu");
    expect(speakersIn("Keynote").map((s) => s.id)).toEqual(["taiwo-oyedele", "samson-ajayi"]);
    expect(by["samson-ajayi"].organisation).toBe("Robert Bosch Nigeria");
    expect(by["seyi-tinubu"].role).toContain("Nigeria 2.0 Talent Fund");
  });

  it("leaves a role empty only where no source gave one", () => {
    expect(speakers.filter((s) => !s.role).map((s) => s.id)).toEqual(["olayemi-cardoso"]);
  });

  it("has full profiles only for the two speakers who supplied one", () => {
    expect(speakers.filter((s) => s.bio).map((s) => s.id)).toEqual(["samson-ajayi", "seye-olurotimi"]);
    for (const s of speakers.filter((x) => x.bio)) {
      expect(s.bio!.length).toBeGreaterThan(2);
      for (const p of s.bio!) expect(p.length).toBeGreaterThan(60);
      expect(new Set(s.bio!.map((p) => p.slice(0, 40))).size).toBe(s.bio!.length); // React keys
    }
  });

  it("lists every speaker as a performer in the event's structured data", () => {
    const ld = eventJsonLd();
    expect(ld.performer.map((p) => p.name)).toEqual(speakers.map((s) => s.name));
    expect(ld.performer.every((p) => p["@type"] === "Person")).toBe(true);
  });
});

describe("partner logos", () => {
  const partners = partnerCategories.flatMap((c) => c.partners);
  it.each(partners)("$name has a PNG logo at 2x the flyer crop", async (p) => {
    const file = join(PUBLIC, p.logo);
    expect(existsSync(file)).toBe(true);
    const meta = await sharp(file).metadata();
    expect(meta.format).toBe("png");
    expect(meta.height).toBe(96);
    expect(meta.width).toBeGreaterThanOrEqual(150);
  });

  it("every file in public/partners is used", () => {
    const used = new Set(partners.map((p) => p.logo.replace("/partners/", "")));
    expect(readdirSync(join(PUBLIC, "partners")).filter((f) => !used.has(f))).toEqual([]);
  });
});
