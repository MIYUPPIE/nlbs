import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { leadership } from "@/data/vision";

describe("leadership portraits", () => {
  it.each(leadership)("$name has a real, correctly sized photo", async (p) => {
    const file = join(process.cwd(), "public", p.photo.src);
    expect(existsSync(file)).toBe(true);
    const meta = await sharp(file).metadata();
    expect([meta.width, meta.height]).toEqual([p.photo.width, p.photo.height]);
    expect(p.photo.width / p.photo.height).toBeCloseTo(0.8, 2);
  });
});
