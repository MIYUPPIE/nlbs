/**
 * Gate tests for the Nigeria 2.0 seamless Instagram carousel
 * (social/summit-carousel). Pure checks: copy, facts, geometry, HTML shape.
 * The pixel-level rules (glyph safe areas, crossers, seams) run in
 * `npm run carousel:render`.
 */
import { describe, expect, it } from "vitest";
import { contact, event, formatStat, stats } from "@/data/event";
import { whatToExpect } from "@/data/content";
import { partners } from "@/data/partners";
import { preEventTimeline } from "@/data/registration-plan";
import { speakers } from "@/data/speakers";
import { registrationClosure } from "@/lib/registration-window";
import { allCopy, carousel } from "../social/summit-carousel/content";
import { buildHtml, GUEST_ROWS, threadPoints } from "../social/summit-carousel/html";
import {
  PANORAMA_W,
  SLIDE_COUNT,
  SLIDE_H,
  SLIDE_W,
  crossesJoin,
  joins,
  seeded,
  slideOf,
  smoothPath,
  textViolation,
} from "../social/summit-carousel/layout";

const html = buildHtml(
  carousel,
  (p) => `asset:${p}`,
  (f) => `font:${f}`,
);

describe("carousel facts come from src/data", () => {
  it("cover carries the verified date, time and venue", () => {
    expect(carousel.cover.date).toBe(event.date.display);
    expect(carousel.cover.time).toBe(event.date.startDisplay);
    expect(carousel.cover.venue).toBe(event.venue.display);
    expect(carousel.cover.kicker).toBe(event.name);
    expect(carousel.cover.swipe).toBe("Swipe →");
  });

  it("23 November 2026 is a Monday, so the 'on Monday' hook is true", () => {
    expect(carousel.cover.hook).toMatch(/Monday/);
    expect(new Date(`${event.date.iso}T12:00:00Z`).getUTCDay()).toBe(1);
  });

  it("uses all four figures, each still labelled Expected or Target", () => {
    expect(carousel.numbers.stats.map((s) => s.value)).toEqual(stats.map((s) => formatStat(s)));
    for (const s of carousel.numbers.stats) {
      expect(s.label).toMatch(/Expected|Target/);
      expect(["expected", "target"]).toContain(s.kind);
    }
    expect(carousel.numbers.body).toMatch(/not results/);
  });

  it("names every speaker from src/data exactly once, and nobody else", () => {
    const shown = [
      carousel.voices.chiefHost.name,
      ...carousel.voices.keynotes.map((p) => p.name),
      ...carousel.guests.people.map((p) => p.name.replace(/^His Excellency /, "")),
    ];
    expect(shown.sort()).toEqual(speakers.map((s) => s.name).sort());
  });

  it("shows each speaker's photo from src/data", () => {
    const photos = new Map(speakers.map((s) => [s.photo.src, s.name]));
    for (const p of [carousel.voices.chiefHost, ...carousel.voices.keynotes, ...carousel.guests.people])
      expect(photos.has(p.photo)).toBe(true);
  });

  it("day plan, partners, handle and tagline match the site", () => {
    expect(carousel.day.items).toEqual(whatToExpect.map((w) => ({ title: w.title, detail: w.detail })));
    expect(carousel.cta.partners.map((p) => p.name)).toEqual(partners.map((p) => p.name));
    expect(carousel.cta.follow).toBe(contact.socialHandle);
    expect(carousel.cta.closing).toBe(event.tagline);
  });

  it("CTA tells the truth about registration and the QR email", () => {
    expect(carousel.cta.body).toContain(registrationClosure.closed);
    const qr = preEventTimeline.find((t) => /QR code/.test(t.what));
    expect(qr?.channel).toBe("Email");
    expect(carousel.cta.body).toMatch(/QR code and the venue map come by email/);
    expect(carousel.cta.save).toBe("Save");
    expect(carousel.cta.share).toBe("Share");
  });

  it("has no em dashes and no placeholder brackets", () => {
    for (const s of allCopy()) {
      expect(s).not.toMatch(/—/);
      expect(s).not.toMatch(/\[[^\]]*\]/);
    }
  });
});

describe("layout geometry", () => {
  it("panorama is 7 x 1080 by 1350 (4:5 slides)", () => {
    expect(SLIDE_COUNT).toBe(7);
    expect(PANORAMA_W).toBe(7560);
    expect(SLIDE_W / SLIDE_H).toBeCloseTo(4 / 5);
    expect(joins()).toEqual([1080, 2160, 3240, 4320, 5400, 6480]);
  });

  it("textViolation enforces the 60px safe area and the no-crossing rule", () => {
    expect(textViolation({ left: 60, top: 60, right: 1020, bottom: 1290 }, 0)).toBeNull();
    expect(textViolation({ left: 59, top: 100, right: 500, bottom: 200 }, 0)).toMatch(/left/);
    expect(textViolation({ left: 100, top: 100, right: 1021, bottom: 200 }, 0)).toMatch(/right/);
    expect(textViolation({ left: 1000, top: 100, right: 1200, bottom: 200 }, 0)).toMatch(/right/);
    expect(textViolation({ left: 100, top: 59, right: 200, bottom: 200 }, 0)).toMatch(/top/);
    expect(textViolation({ left: 100, top: 100, right: 200, bottom: 1291 }, 0)).toMatch(/bottom/);
    expect(textViolation({ left: 1200, top: 100, right: 1300, bottom: 200 }, 0)).toMatch(
      /belongs to slide 1/,
    );
    expect(slideOf({ left: 2160, top: 0, right: 2200, bottom: 1 })).toBe(2);
  });

  it("crossesJoin needs real reach into both slides", () => {
    expect(crossesJoin({ left: 1000, top: 0, right: 1160, bottom: 10 }, 1080)).toBe(true);
    expect(crossesJoin({ left: 1050, top: 0, right: 1160, bottom: 10 }, 1080)).toBe(false);
  });

  it("thread starts left of the panorama and ends inside slide 7", () => {
    const pts = threadPoints();
    expect(pts[0][0]).toBeLessThan(0);
    const end = pts[pts.length - 1];
    expect(end[0]).toBeGreaterThan(6 * SLIDE_W + SLIDE_W / 2);
    expect(end[0]).toBeLessThan(PANORAMA_W);
    for (const [, y] of pts) expect(y).toBeGreaterThan(1150);
    expect(smoothPath(pts).startsWith("M-30,")).toBe(true);
  });

  it("seeded PRNG is deterministic", () => {
    const a = seeded(7);
    const b = seeded(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("guest rows fit between heading and skyline", () => {
    expect(GUEST_ROWS).toHaveLength(carousel.guests.people.length);
    expect(GUEST_ROWS[0] - 70).toBeGreaterThan(300);
    expect(GUEST_ROWS[GUEST_ROWS.length - 1] + 70).toBeLessThan(1170);
  });
});

describe("built HTML", () => {
  it("has seven slide sections and one thread", () => {
    expect(html.match(/<section class="slide"/g)).toHaveLength(7);
    expect(html.match(/id="threadPath"/g)).toHaveLength(1);
  });

  it("declares a crossing element for every join", () => {
    for (const name of ["orbit", "ghost", "chief-host", "guest-1", "bridge", "bars"])
      expect(html).toContain(`data-cross="${name}"`);
  });

  it("loads only local assets and fonts (no network at render)", () => {
    expect(html).not.toMatch(/https?:\/\//);
    expect(html).toContain("font:geist-latin.woff2");
    expect(html).toContain("asset:/brand/nlbs-logo.png");
  });

  it("escapes copy", () => {
    expect(html).toContain("Nigeria’s next decade");
    expect(html).not.toMatch(/<p class="hook">[^<]*<[^/]/);
  });
});
