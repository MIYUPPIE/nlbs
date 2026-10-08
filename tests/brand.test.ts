/**
 * The Nigeria 2.0 logo is our own (src/lib/logo.ts, Oct 2026). Guards: one
 * geometry everywhere (site, icons, public/brand files, generator script),
 * logo files use outlined lettering (no font needed to view them), the mark
 * stays legible at favicon size, and the watermarked Design.com preview the
 * convener once sent (NLBS/logo.jpeg) is never used.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { LOGO_GLYPH, LOGO_MARK, LOGO_TILE } from "@/lib/logo";

const ROOT = join(__dirname, "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const squash = (s: string) => s.replace(/>\s+</g, "><").trim();

const files = (dir: string): string[] =>
  readdirSync(join(ROOT, dir)).flatMap((n) => {
    const p = join(dir, n);
    return statSync(join(ROOT, p)).isDirectory() ? files(p) : [p];
  });

describe("Nigeria 2.0 logo", () => {
  it("the mark is the tile plus the glyph, in the site colours", () => {
    expect(LOGO_MARK).toBe(LOGO_TILE + LOGO_GLYPH);
    const css = read("src/app/globals.css");
    for (const hex of ["#071A33", "#D4AF37", "#F8F7F2"]) {
      expect(LOGO_MARK).toContain(hex);
      expect(css.toLowerCase()).toContain(hex.toLowerCase());
    }
  });

  it("public/brand files and the generator script draw exactly the same mark", () => {
    for (const f of ["nlbs-mark.svg", "nlbs-logo-dark.svg", "nlbs-logo-light.svg"]) {
      expect(squash(read(`public/brand/${f}`)), f).toContain(LOGO_MARK);
    }
    const py = read("scripts/brand/build-logo.py");
    const mark = py.match(/^MARK = f"""([\s\S]*?)"""/m)?.[1] ?? "";
    const filled = mark
      .replace(/\{NAVY_950\}/g, "#071A33")
      .replace(/\{GOLD\}/g, "#D4AF37")
      .replace(/\{IVORY\}/g, "#F8F7F2");
    expect(squash(filled)).toBe(LOGO_MARK);
  });

  it("logo files are self-contained vectors: outlined lettering, no fonts, images or scripts", () => {
    for (const f of ["nlbs-mark.svg", "nlbs-logo-dark.svg", "nlbs-logo-light.svg"]) {
      const svg = read(`public/brand/${f}`);
      expect(svg, f).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 \d+ 64"/);
      expect(svg, f).toMatch(/aria-label="Nigeria 2\.0/);
      expect(svg, f).not.toMatch(/<(text|image|script|style|foreignObject)\b|font-family|href=/);
    }
    // the lockups carry the lettering as paths: name, "2.0" and the event line
    expect(read("public/brand/nlbs-logo-dark.svg").match(/<path /g)).toHaveLength(3);
  });

  it("stays legible at favicon size: gold and ivory both show at 16px", async () => {
    const svg = Buffer.from(read("public/brand/nlbs-mark.svg"));
    const { data, info } = await sharp(svg, { density: 72 })
      .resize(16, 16)
      .raw()
      .toBuffer({ resolveWithObject: true });
    let gold = 0;
    let ivory = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      if (r > 170 && g > 140 && b < 120) gold++;
      if (r > 200 && g > 200 && b > 190) ivory++;
    }
    expect(gold).toBeGreaterThanOrEqual(6);
    expect(ivory).toBeGreaterThanOrEqual(6);
  });

  it("the header/footer wordmark draws the mark, not the old 2.0 text badge", () => {
    const wordmark = read("src/components/layout/Wordmark.tsx");
    expect(wordmark).toContain("<LogoMark");
    expect(wordmark).not.toContain("border-gold/50 bg-navy-900 font-display"); // the old badge
    for (const f of ["src/app/icon.tsx", "src/app/apple-icon.tsx", "src/app/opengraph-image.tsx"]) {
      expect(read(f), f).toContain("logoDataUri(");
    }
  });

  it("the Design.com preview is never published or referenced", () => {
    expect(existsSync(join(ROOT, "public", "logo.jpeg"))).toBe(false);
    for (const f of [...files("src"), ...files("public")].filter((p) =>
      /\.(tsx?|css|svg|json|html)$/.test(p),
    )) {
      const text = read(f);
      expect(text, f).not.toMatch(/design\.com/i);
      expect(text, f).not.toMatch(/logo\.jpe?g/i);
    }
  });
});
