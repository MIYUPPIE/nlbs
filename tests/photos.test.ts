/**
 * Guards the real-photo pipeline (content/photos.json -> scripts/sync-photos.mjs
 * -> public/photos + src/data/photos.generated.json). Photos must be real,
 * licensed for reuse, credited wherever they render, and never presented as
 * pictures of the summit or its 2025 edition.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { allRoutes, legalNav } from "@/data/navigation";
import { photo, photos } from "@/data/photos";
import { ALLOWED_LICENCES, entryError, firstHref, stripHtml } from "../scripts/sync-photos.mjs";

const ROOT = join(__dirname, "..");
const manifest = JSON.parse(readFileSync(join(ROOT, "content", "photos.json"), "utf8")) as {
  photos: { id: string; kind: string; event?: string; commons: string; alt: string; caption: string }[];
};

describe("photo manifest and synced output", () => {
  it("generated data matches the manifest one to one", () => {
    expect(photos.map((p) => p.id)).toEqual(manifest.photos.map((p) => p.id));
    for (const [i, m] of manifest.photos.entries()) {
      expect(photos[i].title).toBe(m.commons);
      expect(photos[i].alt).toBe(m.alt);
      expect(photos[i].caption).toBe(m.caption);
      expect(photos[i].kind).toBe(m.kind);
      expect(photos[i].event).toBe(m.event ?? null);
    }
  });

  it("every manifest entry passes the sync script's own validation", () => {
    for (const m of manifest.photos) expect(entryError(m), m.id).toBeNull();
  });

  it("the PhotoId type lists exactly the synced ids", () => {
    const src = readFileSync(join(ROOT, "src/data/photos.ts"), "utf8");
    const union = /export type PhotoId =([^;]+);/.exec(src)![1];
    const ids = [...union.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]);
    expect(ids.sort()).toEqual(photos.map((p) => p.id).sort());
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

describe("content rule: no photo passes as the summit", () => {
  const SUMMIT =
    /\b(NLBS|Nigeria 2\.0|Nigerian Leadership Business Summit|Leadership Beyond the Norm|HBC)\b/i;

  it("no photo's alt, caption or event names this summit or its 2025 edition", () => {
    for (const p of photos) expect(`${p.alt} ${p.caption} ${p.event ?? ""}`, p.id).not.toMatch(SUMMIT);
  });

  it("every event photo names the real event it shows in its caption", () => {
    const events = photos.filter((p) => p.kind === "event");
    expect(events.length).toBeGreaterThanOrEqual(5);
    for (const p of events) {
      expect(p.event, p.id).toBeTruthy();
      expect(p.caption).toContain(p.event!);
    }
  });

  it("place photos make no claim about people or events", () => {
    for (const p of photos.filter((x) => x.kind === "place")) {
      expect(`${p.alt} ${p.caption}`).not.toMatch(
        /\b(20(1|2)\d|summit|edition|delegates?|attendees?|speakers?|panel)\b/i,
      );
    }
  });

  it("the 2025 edition section renders no photos until real event photos exist", () => {
    const src = readFileSync(join(ROOT, "src/components/sections/EditionSection.tsx"), "utf8");
    expect(src).not.toMatch(/@\/data\/photos|<Image/);
  });

  it("every photo is credited on /credits, which the footer links from every page", () => {
    const page = readFileSync(join(ROOT, "src/app/credits/page.tsx"), "utf8");
    expect(page).toMatch(/photos\.map\(/);
    expect(page).toMatch(/<PhotoCredit\b/);
    expect(legalNav.map((l) => l.href)).toContain("/credits");
    expect(allRoutes as readonly string[]).toContain("/credits");
  });

  it("the uncaptioned conference tiles still say they are not from Nigeria 2.0 and link to credits", () => {
    const src = readFileSync(join(ROOT, "src/components/sections/InTheRoomSection.tsx"), "utf8");
    expect(src).toMatch(/not from Nigeria 2\.0/);
    expect(src).toMatch(/href="\/credits"/);
  });
});

describe("sync script helpers", () => {
  it("allowlist accepts reusable licences and rejects the rest", () => {
    for (const ok of ["CC BY-SA 4.0", "CC BY 2.0", "CC0", "Public domain"])
      expect(ok).toMatch(ALLOWED_LICENCES);
    for (const bad of ["CC BY-NC 4.0", "CC BY-ND 4.0", "All rights reserved", "Fair use", ""])
      expect(bad).not.toMatch(ALLOWED_LICENCES);
  });

  it("entryError rejects event photos that hide which event they show", () => {
    const base = { id: "x", commons: "File:x.jpg", alt: "a", caption: "At Foo Conf 2024.", kind: "event" };
    expect(entryError({ ...base, event: "Foo Conf 2024" })).toBeNull();
    expect(entryError(base)).toMatch(/must name the event/);
    expect(entryError({ ...base, event: "Bar Forum" })).toMatch(/caption must name/);
    expect(entryError({ ...base, kind: "place", event: "Foo Conf 2024" })).toMatch(/only event photos/);
    expect(entryError({ ...base, kind: "stock" })).toMatch(/kind must be/);
    expect(entryError({ ...base, commons: "https://example.com/x.jpg" })).toMatch(/File: title/);
  });

  it("strips Commons artist HTML to plain text and extracts the first link", () => {
    const html = '<a href="//commons.wikimedia.org/wiki/User:A_B" title="User:A B">A &amp; B</a>\n';
    expect(stripHtml(html)).toBe("A & B");
    expect(firstHref(html)).toBe("https://commons.wikimedia.org/wiki/User:A_B");
    expect(firstHref("Unknown author")).toBeNull();
  });
});
