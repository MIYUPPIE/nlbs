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

  it("uses the contact details from the convener's documents", () => {
    expect(contact.email).toBe("info@nlbs.com.ng");
    expect(contact.phone).toBe("+234 803 231 5349");
    expect(contact.socials).toEqual([]); // handle only, no unverified profile URLs
  });

  // Names and claims from client drafts that CONTRADICT the brief or other
  // pages (named keynotes vs "speakers to be announced", media partners vs
  // "partners to be announced", prospectus figures vs $50M+). They must not
  // reach src/. Client-approved FAQ text lives in content/, outside this scan.
  // Approved from latest/1.md, 2.md and the flyer: Seyi Tinubu (Youth
  // Patron), $1 Trillion agenda, 9:00 AM start, info@ email and phone.
  it.each([
    "Dangote",
    "Elumelu",
    "BUA",
    "MTN",
    "Flutterwave",
    "Arise",
    "Channels TV",
    "TechCabal",
    "Access Bank",
    "$500M",
    "$150B",
    "$100B",
    "N594M",
    "N50M",
    "Honeywell",
    "talentfund2026",
    "talentfundnigeria20",
  ])("source does not mention %s", (term) => {
    expect(sourceText.includes(term)).toBe(false);
  });

  it("never publishes confidential documents", () => {
    const files = readdirSync(join(__dirname, "..", "public", "downloads"));
    expect(files.some((f) => /prospectus|stakeholder|sponsor|internal|application_form|youth/i.test(f))).toBe(
      false,
    );
  });

  it("has no ticket pricing or payment flow", () => {
    // Naira amounts are only allowed as Talent Fund answer options (monthly revenue bands).
    const allowNaira = new Set([join(SRC, "lib", "talent-form.ts")]);
    const priced = walk(SRC).filter(
      (p) => !allowNaira.has(p) && /[₦N]\s?\d{1,3}(,\d{3})+/.test(readFileSync(p, "utf8")),
    );
    expect(priced).toEqual([]);
    expect(sourceText.toLowerCase()).not.toMatch(/checkout|paystack|flutterwave|stripe/);
  });
});

describe("structured data", () => {
  it("describes the event with the confirmed 9:00 AM WAT start", () => {
    const ld = eventJsonLd();
    expect(ld["@type"]).toBe("Event");
    expect(ld.name).toBe(event.fullName);
    expect(ld.startDate).toBe("2026-11-27T09:00:00+01:00");
    expect(ld.endDate).toBe("2026-11-27");
    expect(ld.location.name).toBe("Eko Convention Centre");
    expect(ld.location.address.addressLocality).toBe("Lagos");
    expect(ld.location.address.addressCountry).toBe("NG");
  });
});
