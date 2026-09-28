/**
 * Parses the design tokens from globals.css and verifies WCAG AA contrast
 * for every text/background pairing the components use.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(__dirname, "..", "src", "app", "globals.css"), "utf8");
const token = (name: string): string => {
  const m = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css);
  if (!m) throw new Error(`Token --color-${name} not found`);
  return m[1];
};

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const AA = 4.5;

// [text, background, minimum]
const pairs: [string, string, number][] = [
  ["ink", "ivory", AA],
  ["muted", "ivory", AA],
  ["muted", "white", AA],
  ["gold-ink", "ivory", AA],
  ["gold-ink", "white", AA],
  ["navy-950", "ivory", AA],
  ["gold", "navy-950", AA],
  ["gold", "navy-900", AA],
  ["gold", "navy-700", AA],
  ["mist", "navy-950", AA],
  ["mist", "navy-900", AA],
  ["navy-950", "gold", AA],
  ["navy-950", "gold-bright", AA],
];

const hex = (n: string) => (n === "white" ? "#ffffff" : token(n));

describe("design token contrast (WCAG AA)", () => {
  it.each(pairs)("%s on %s", (fg, bg, min) => {
    expect(contrast(hex(fg), hex(bg))).toBeGreaterThanOrEqual(min);
  });

  it("raw gold is NOT allowed as text on light surfaces", () => {
    // Documents why gold-ink exists.
    expect(contrast(token("gold"), token("ivory"))).toBeLessThan(3);
  });
});

describe("gold text usage on light surfaces", () => {
  it("light-surface components never use raw text-gold for body text", () => {
    // SectionHeading, PillarCard etc. must use text-gold-ink on light tones.
    const heading = readFileSync(
      join(__dirname, "..", "src", "components", "ui", "SectionHeading.tsx"),
      "utf8",
    );
    expect(heading).toMatch(/dark \? "text-gold" : "text-gold-ink"/);
  });
});
