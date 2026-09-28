/**
 * Guards the brief's content rule: no fabricated facts, targets stay targets.
 * These fail the build if someone adds an unverified claim.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contact, event, formatStat, stats } from "@/data/event";
import { programme } from "@/data/programme";
import { speakers } from "@/data/speakers";
import { partnerCategories } from "@/data/partners";
import { eventJsonLd } from "@/lib/site";

const SRC = join(__dirname, "..", "src");
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|css)$/.test(p) ? [p] : [];
  });
const sourceText = walk(SRC)
  .map((p) => readFileSync(p, "utf8"))
  .join("\n");

describe("verified event facts", () => {
  it("match the brief exactly", () => {
    expect(event.fullName).toBe("Nigeria 2.0 Nigerian Leadership Business Summit 2026");
    expect(event.theme).toBe("Nigeria 2.0: Unlocking Capital, Talent & Technology for a Resilient Economy");
    expect(event.tagline).toBe("Invest in People. Invest in Possibilities.");
    expect(event.date.display).toBe("Friday, 27 November 2026");
    expect(event.venue.display).toBe("Eko Convention Centre, Lagos");
    expect(event.convener).toBe("HBC Business Help");
    expect(event.previousEdition).toEqual({ year: 2025, theme: "Leadership Beyond the Norm" });
  });

  it("27 November 2026 is a Friday", () => {
    expect(new Date(`${event.date.iso}T12:00:00Z`).getUTCDay()).toBe(5);
  });
});

describe("statistics", () => {
  it("are exactly the four brief figures", () => {
    expect(stats.map((s) => formatStat(s))).toEqual(["800+", "$50M+", "10,000", "200+"]);
  });

  it("are all labelled as expectations or targets, never results", () => {
    for (const s of stats) {
      expect(["expected", "target"]).toContain(s.kind);
      expect(s.label).toMatch(/Target|Expected/);
    }
    expect(stats.filter((s) => s.kind === "target").map((s) => s.id)).toEqual([
      "investment",
      "talent",
      "meetings",
    ]);
  });
});

describe("no fabricated content", () => {
  it("has no confirmed speakers until real ones are supplied", () => {
    for (const s of speakers) {
      if (!s.confirmed) {
        expect(s.name).toBe("Speaker Name");
        expect(s.photo).toBeNull();
      }
    }
  });

  it("has no partners or logos until real ones are supplied", () => {
    expect(partnerCategories.flatMap((c) => c.partners)).toEqual([]);
    expect(partnerCategories.map((c) => c.label)).toEqual([
      "Strategic Partners",
      "Government Partners",
      "Development Partners",
      "Investment Partners",
      "Technology Partners",
      "Media Partners",
    ]);
  });

  it("has no programme times", () => {
    expect(programme.every((p) => p.time === null)).toBe(true);
  });

  it("has no contact details until confirmed", () => {
    expect(contact).toEqual({ email: null, phone: null, socials: [] });
  });

  // Names and claims that appear in unverified client drafts. They must not
  // reach the site until the convener confirms them.
  it.each([
    "Dangote",
    "Elumelu",
    "Tinubu",
    "Seyi",
    "BUA",
    "MTN",
    "Flutterwave",
    "Arise",
    "Channels TV",
    "TechCabal",
    "Access Bank",
    "$500M",
    "$1 Trillion",
    "N50M",
    "9AM",
    "9:00",
    "info@nlbs",
    "+234 803",
  ])("source does not mention %s", (term) => {
    expect(sourceText.includes(term)).toBe(false);
  });

  it("has no ticket pricing or payment flow", () => {
    expect(sourceText).not.toMatch(/[₦N]\s?\d{1,3}(,\d{3})+/);
    expect(sourceText.toLowerCase()).not.toMatch(/checkout|paystack|flutterwave|stripe/);
  });
});

describe("structured data", () => {
  it("describes the event with a date-only start and no invented time", () => {
    const ld = eventJsonLd();
    expect(ld["@type"]).toBe("Event");
    expect(ld.name).toBe(event.fullName);
    expect(ld.startDate).toBe("2026-11-27");
    expect(ld.startDate).not.toMatch(/T/);
    expect(ld.location.name).toBe("Eko Convention Centre");
    expect(ld.location.address.addressLocality).toBe("Lagos");
    expect(ld.location.address.addressCountry).toBe("NG");
  });
});
