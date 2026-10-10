/**
 * The site uses the convener's official NLBS logo (scripts/brand/
 * nlbs-logo-source.jpg, a copy of NLBS/logo.jpg). Guards: every asset in
 * src/lib/logo.ts exists at its recorded size with a real transparent
 * background, the header/footer and icons use it, and the watermarked
 * Design.com preview (NLBS/logo.jpeg) is never published or referenced.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { LOGO } from "@/lib/logo";

const ROOT = join(__dirname, "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const pub = (url: string) => join(ROOT, "public", url);

const files = (dir: string): string[] =>
  readdirSync(join(ROOT, dir)).flatMap((n) => {
    const p = join(dir, n);
    return statSync(join(ROOT, p)).isDirectory() ? files(p) : [p];
  });

/** Share of fully transparent pixels and of opaque pixels. */
async function alphaProfile(url: string) {
  const { data, info } = await sharp(pub(url)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let clear = 0;
  let solid = 0;
  for (let i = 3; i < data.length; i += info.channels) {
    if (data[i] === 0) clear++;
    if (data[i] === 255) solid++;
  }
  const n = data.length / info.channels;
  return { clear: clear / n, solid: solid / n, width: info.width, height: info.height };
}

describe("NLBS logo", () => {
  it("every logo asset exists and the source is the convener's file", () => {
    for (const url of [LOGO.icon, LOGO.tile, LOGO.full, LOGO.fullLight])
      expect(existsSync(pub(url)), url).toBe(true);
    expect(existsSync(join(ROOT, "scripts/brand/nlbs-logo-source.jpg"))).toBe(true);
    expect(existsSync(pub("/brand/nlbs-logo-navy.png"))).toBe(true);
  });

  it("cut-outs have a real transparent background and the recorded size", async () => {
    for (const url of [LOGO.icon, LOGO.full, LOGO.fullLight]) {
      const a = await alphaProfile(url);
      expect(a.clear, `${url} background`).toBeGreaterThan(0.45);
      expect(a.solid, `${url} artwork`).toBeGreaterThan(0.05);
    }
    const full = await sharp(pub(LOGO.full)).metadata();
    expect({ width: full.width, height: full.height }).toEqual(LOGO.fullSize);
    const icon = await sharp(pub(LOGO.icon)).metadata();
    expect([icon.width, icon.height]).toEqual([512, 512]);
  });

  it("the light variant has navy lettering where the dark one has white", async () => {
    // Middle of the "NIGERIA LEADERSHIP" line in the 1083x659 files.
    const sample = async (url: string) => {
      const { data, info } = await sharp(pub(url))
        .extract({ left: 0, top: 455, width: 1083, height: 70 })
        .raw()
        .toBuffer({ resolveWithObject: true });
      let light = 0;
      let dark = 0;
      for (let i = 0; i < data.length; i += info.channels) {
        if (data[i + 3] < 200) continue;
        const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (lum > 200) light++;
        if (lum < 60) dark++;
      }
      return { light, dark };
    };
    const dark = await sample(LOGO.full);
    const light = await sample(LOGO.fullLight);
    expect(dark.light).toBeGreaterThan(1000);
    expect(light.dark).toBeGreaterThan(1000);
    expect(light.light).toBeLessThan(dark.light / 10);
  });

  it("the tile is opaque navy, so the favicon has no ragged edge", async () => {
    const a = await alphaProfile(LOGO.tile);
    expect(a.solid).toBe(1);
    const { data } = await sharp(pub(LOGO.tile))
      .extract({ left: 0, top: 0, width: 1, height: 1 })
      .raw()
      .toBuffer({ resolveWithObject: true });
    expect([...data.subarray(0, 3)]).toEqual([7, 26, 51]);
  });

  it("header/footer, favicon, app icon, share image and manifest use the logo", () => {
    expect(read("src/components/layout/Wordmark.tsx")).toContain("<LogoMark");
    expect(read("src/components/layout/LogoMark.tsx")).toContain("LOGO.icon");
    expect(read("src/components/layout/Footer.tsx")).toContain("LOGO.full");
    expect(read("src/app/icon.tsx")).toContain('brandDataUri("nlbs-icon-tile.png")');
    expect(read("src/app/apple-icon.tsx")).toContain('brandDataUri("nlbs-icon-tile.png")');
    expect(read("src/app/opengraph-image.tsx")).toContain('brandDataUri("nlbs-icon.png")');
    expect(read("src/app/manifest.ts")).toContain("/brand/nlbs-icon-tile.png");
  });

  it("the Design.com preview is never published or referenced", () => {
    expect(existsSync(join(ROOT, "public", "logo.jpeg"))).toBe(false);
    for (const f of [...files("src"), ...files("public")].filter((p) =>
      /\.(tsx?|css|svg|json|html)$/.test(p),
    )) {
      const text = read(f);
      expect(text, f).not.toMatch(/design\.com/i);
      expect(text, f).not.toMatch(/logo\.jpeg/i);
    }
  });
});
