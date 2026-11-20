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
import { PARTNER_LOGO_SIZE, partners } from "@/data/partners";
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

  it("gives every speaker a role, with the titles verified online (19 Nov 2026)", () => {
    const by = Object.fromEntries(speakers.map((s) => [s.id, s]));
    for (const s of speakers) expect(s.role.length).toBeGreaterThan(0);
    expect(by["taiwo-oyedele"].role).toBe(
      "Honourable Minister of Finance and Coordinating Minister of the Economy",
    );
    expect([by["olayemi-cardoso"].role, by["olayemi-cardoso"].organisation]).toEqual([
      "Governor",
      "Central Bank of Nigeria",
    ]);
  });

  it("gives every speaker a full profile", () => {
    for (const s of speakers) {
      expect(s.bio, s.id).toBeDefined();
      expect(s.bio!.length).toBeGreaterThanOrEqual(3);
      for (const p of s.bio!) {
        expect(p.length).toBeGreaterThan(60);
        expect(p).not.toMatch(/\u2014/); // house style: no em dashes
      }
      expect(new Set(s.bio!.map((p) => p.slice(0, 40))).size).toBe(s.bio!.length); // React keys
    }
  });

  it("supplied profiles carry no sources; researched ones cite at least one https source", () => {
    const supplied = ["samson-ajayi", "seye-olurotimi"];
    for (const s of speakers) {
      if (supplied.includes(s.id)) {
        expect(s.sources, s.id).toBeUndefined();
      } else {
        expect(s.sources?.length, s.id).toBeGreaterThan(0);
        for (const src of s.sources!) {
          expect(src.url).toMatch(/^https:\/\//);
          expect(src.title.length).toBeGreaterThan(5);
        }
      }
    }
  });

  it("lists every speaker as a performer in the event's structured data", () => {
    const ld = eventJsonLd();
    expect(ld.performer.map((p) => p.name)).toEqual(speakers.map((s) => s.name));
    expect(ld.performer.every((p) => p["@type"] === "Person")).toBe(true);
  });
});

describe("partner logos", () => {
  it.each(partners)("$name has a 480x240 PNG logo tile", async (p) => {
    const file = join(PUBLIC, p.logo);
    expect(existsSync(file)).toBe(true);
    const meta = await sharp(file).metadata();
    expect(meta.format).toBe("png");
    expect([meta.width, meta.height]).toEqual([PARTNER_LOGO_SIZE.width, PARTNER_LOGO_SIZE.height]);
  });

  it.each(partners)("$name's logo has artwork on a flat brand background", async (p) => {
    // Regression: the old flyer crops cut "Keystone" to "Keyston" and kept the flyer's
    // grey tile behind allevents.ng and Praxis. A tile's four corners must match (one flat
    // background) and the artwork must stay clear of every edge (nothing cut off).
    const { data, info } = await sharp(join(PUBLIC, p.logo))
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const px = (x: number, y: number) => [
      ...data.subarray((y * info.width + x) * 3, (y * info.width + x) * 3 + 3),
    ];
    const bg = px(0, 0);
    const near = (c: number[]) => c.every((v, i) => Math.abs(v - bg[i]) <= 6);
    for (const c of [px(info.width - 1, 0), px(0, info.height - 1), px(info.width - 1, info.height - 1)]) {
      expect(near(c)).toBe(true);
    }
    for (let x = 0; x < info.width; x++) {
      for (const y of [0, 1, 2, info.height - 3, info.height - 2, info.height - 1])
        expect(near(px(x, y))).toBe(true);
    }
    for (let y = 0; y < info.height; y++) {
      for (const x of [0, 1, 2, info.width - 3, info.width - 2, info.width - 1])
        expect(near(px(x, y))).toBe(true);
    }
    let ink = 0;
    for (let i = 0; i < data.length; i += 3) if (!near([data[i], data[i + 1], data[i + 2]])) ink++;
    expect(ink / (info.width * info.height)).toBeGreaterThan(0.04);
  });

  it("the white tiles are pure white, not the flyer's off-white", async () => {
    for (const f of ["dmax-media.png", "allevents-ng.png", "praxis-medical.png"]) {
      const { data } = await sharp(join(PUBLIC, "partners", f))
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      expect([...data.subarray(0, 3)]).toEqual([255, 255, 255]);
    }
  });

  it("every file in public/partners is used", () => {
    const used = new Set(partners.map((p) => p.logo.replace("/partners/", "")));
    expect(readdirSync(join(PUBLIC, "partners")).filter((f) => !used.has(f))).toEqual([]);
  });
});
