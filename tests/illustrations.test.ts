/**
 * AI-generated illustrations live apart from real photos and are always
 * disclosed. Guards: files are real WebP of the recorded size with no
 * metadata, alt text says "AI-generated", nothing claims to show the summit,
 * and /credits lists every one under "AI-generated illustrations".
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { illustration, illustrations } from "@/data/illustrations";
import { photos } from "@/data/photos";

const ROOT = join(__dirname, "..");

describe("AI-generated illustrations", () => {
  it("files exist outside public/photos, match recorded size, stay small and carry no metadata", async () => {
    for (const i of illustrations) {
      expect(i.src).toMatch(/^\/illustrations\/[a-z0-9-]+\.webp$/);
      const file = join(ROOT, "public", i.src);
      expect(existsSync(file), i.src).toBe(true);
      expect(statSync(file).size).toBeLessThan(400 * 1024);
      const meta = await sharp(file).metadata();
      expect(meta.format).toBe("webp");
      expect([meta.width, meta.height]).toEqual([i.width, i.height]);
      expect(meta.width).toBeGreaterThanOrEqual(1200);
      expect(meta.exif).toBeUndefined();
    }
  });

  it("are disclosed as AI-generated and never mixed with real photos", () => {
    const photoIds = new Set(photos.map((p) => p.id as string));
    for (const i of illustrations) {
      expect(i.alt).toMatch(/^AI-generated illustration: /);
      expect(i.generator.trim()).not.toBe("");
      expect(i.createdOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(photoIds.has(i.id)).toBe(false);
    }
  });

  it("make no claim to show the summit, a past edition or a named person", () => {
    const summit =
      /\b(NLBS|Nigeria 2\.0 summit|summit|edition|20(1|2)\d delegates|Leadership Beyond the Norm)\b/i;
    for (const i of illustrations) expect(`${i.alt}`, i.id).not.toMatch(summit);
  });

  it("every illustration is listed on /credits and the technology banner is marked", () => {
    const credits = readFileSync(join(ROOT, "src/app/credits/page.tsx"), "utf8");
    expect(credits).toMatch(/illustrations\.map\(/);
    expect(credits).toMatch(/AI-generated illustrations/);
    const tech = readFileSync(join(ROOT, "src/components/sections/TechnologySection.tsx"), "utf8");
    expect(tech).toMatch(/illustration\("technology-productivity"\)/);
    expect(tech).toMatch(/data-ai-generated="true"/);
  });

  it("illustration() throws for an unknown id", () => {
    expect(() => illustration("nope" as never)).toThrow(/missing/);
  });
});
