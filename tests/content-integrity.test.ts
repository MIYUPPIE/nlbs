/**
 * Guards the brief's content rule: no fabricated facts, targets stay targets.
 * These fail the build if someone adds an unverified claim.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contact, event, formatStat, stats } from "@/data/event";
import { programme } from "@/data/programme";
import { speakers } from "@/data/speakers";
import { partners } from "@/data/partners";
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
    expect(event.date.display).toBe("Thursday, 10 December 2026");
    expect(event.venue.display).toBe("Eko Convention Centre, Lagos");
    expect(event.convener).toBe("HBC Business Help");
    expect(event.previousEdition).toEqual({ year: 2025, theme: "Leadership Beyond the Norm" });
  });

  it("10 December 2026 is a Thursday, and display, short and ISO agree", () => {
    expect(event.date.iso).toBe("2026-12-10");
    expect(new Date(`${event.date.iso}T12:00:00Z`).getUTCDay()).toBe(4);
    expect(event.date.short).toBe("10 Dec 2026");
  });

  it("runs 9:00 AM to 5:00 PM WAT, as the new-date flyer says", () => {
    expect([event.date.startTime, event.date.endTime]).toEqual(["09:00", "17:00"]);
    expect(event.date.hoursDisplay).toBe(
      `${event.date.startDisplay.replace(" WAT", "")} to ${event.date.endDisplay}`,
    );
  });

  it("records the move from Monday 23 November, and the old date is earlier", () => {
    const r = event.reschedule;
    expect(r.previousIso).toBe("2026-11-23");
    expect(new Date(`${r.previousIso}T12:00:00Z`).getUTCDay()).toBe(1);
    expect(r.previousDisplay).toBe("Monday, 23 November 2026");
    expect(r.previousShort).toBe("23 Nov 2026");
    expect(r.previousIso < event.date.iso).toBe(true);
    expect(r.tagline).toBe("Same vision. Bigger stage. Better experience.");
    expect(r.validity).toMatch(/remains valid/);
  });
});

describe("the old date never leaks back", () => {
  // Only event.ts may name the previous date (in `reschedule`); everything else derives from it.
  const eventFile = join(SRC, "data", "event.ts");
  const stale = /23(rd)?\s*Nov|November\s*23|2026-11-23|\bMonday\b|\bMon\b/;
  it("no source file outside event.ts mentions 23 November or Monday", () => {
    const hits = walk(SRC).filter((p) => p !== eventFile && stale.test(readFileSync(p, "utf8")));
    expect(hits).toEqual([]);
  });

  it("FAQ Q4 gives the new date and hours, and Q13 no longer pins the summit to November", () => {
    const o = JSON.parse(readFileSync(join(__dirname, "..", "content", "faq-overrides.json"), "utf8"));
    expect(o["4"]).toMatch(/^Thursday, 10th December 2026, Eko Convention Centre/);
    expect(o["4"]).toMatch(/9AM - 5PM/);
    expect(o["13"]).not.toMatch(/November/);
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
  it("publishes only the speakers the convener supplied (Nov 2026 flyer and profiles)", () => {
    // Adding a name here is a content decision: it needs the convener's source in assets-src/speakers/.
    expect(speakers.map((s) => s.name)).toEqual([
      "Babajide Sanwo-Olu",
      "Taiwo Oyedele",
      "Dr. Samson Ajayi",
      "Dr. Bosun Tijani",
      "Dr. Jumoke Oduwole",
      "Dr. Olayemi Cardoso",
      "Mr. Seyi Tinubu",
      "Dr. Seye Olurotimi",
    ]);
    expect(sourceText).not.toContain("Speaker Name");
  });

  it("publishes only the flyer's five partners, with no placeholder categories", () => {
    expect(partners.map((p) => p.name)).toEqual([
      "Keystone Bank",
      "Dmax Media",
      "allevents.ng",
      "TA Media Communications",
      "Praxis Medical Nigeria",
    ]);
    const section = readFileSync(join(process.cwd(), "src/components/sections/PartnersSection.tsx"), "utf8");
    expect(section).not.toContain("Partner to be announced");
    for (const label of [
      "Strategic Partners",
      "Government Partners",
      "Development Partners",
      "Investment Partners",
      "Technology Partners",
      "Media Partners",
    ]) {
      expect(sourceText).not.toContain(label);
    }
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
  // Approved from the Nov 2026 flyer: the speakers and guests of honour in
  // src/data/speakers.ts and the five "In partnership with" organisations.
  // Approved from the prospectus and briefs: the Stakeholder and Sponsor
  // tiers and benefits, without fees (tests/partnership.test.ts).
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
    // University concept note (Oct 2026): funders, auditors and verification
    // partners not confirmed by the convener, so never published.
    "World Bank",
    "UNDP",
    "Big 4",
    "NNPC",
    "Transcorp",
    "KoboToolbox",
    "AccessPay",
    "BVN",
  ])("source does not mention %s", (term) => {
    expect(sourceText.includes(term)).toBe(false);
  });

  it("publishes no client documents as files", () => {
    // The convener's documents are source material for pages, not downloads.
    const PUBLIC = join(__dirname, "..", "public");
    const files = (dir: string): string[] =>
      readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [f]));
    expect(existsSync(join(PUBLIC, "downloads"))).toBe(false);
    expect(files(PUBLIC).filter((f) => /\.(pdf|docx?|pptx?|jpe?g)$/i.test(f))).toEqual([]);
    expect(sourceText).not.toMatch(/\bdownload\b/);
  });

  it("has only the convener's seat price, the book's price, and one payment provider", () => {
    // Naira amounts: Talent Fund answer options (monthly revenue bands), the delegate seat price
    // (convener, 26 Nov 2026, src/data/registration-plan.ts) and the summit book (src/data/book.ts).
    const allowNaira = new Set([
      join(SRC, "lib", "talent-form.ts"),
      join(SRC, "data", "registration-plan.ts"),
      join(SRC, "data", "book.ts"),
    ]);
    const priced = walk(SRC).filter(
      (p) => !allowNaira.has(p) && /[₦N]\s?\d{1,3}(,\d{3})+/.test(readFileSync(p, "utf8")),
    );
    expect(priced).toEqual([]);
    const plan = readFileSync(join(SRC, "data", "registration-plan.ts"), "utf8");
    expect([...plan.matchAll(/₦\s?(\d{1,3}(?:,\d{3})+)/g)].map((m) => m[1])).toEqual(["15,000"]);
    // The summit book's price, checked against the book site in tests/book-offer.test.ts.
    const book = readFileSync(join(SRC, "data", "book.ts"), "utf8");
    expect([...book.matchAll(/₦\s?(\d{1,3}(?:,\d{3})+)/g)].map((m) => m[1])).toEqual(["10,000"]);
    expect(sourceText.toLowerCase()).not.toMatch(/flutterwave|stripe|paypal|interswitch|remita/);
  });
});

describe("structured data", () => {
  it("describes the event with the confirmed 9:00 AM WAT start", () => {
    const ld = eventJsonLd();
    expect(ld["@type"]).toBe("Event");
    expect(ld.name).toBe(event.fullName);
    expect(ld.startDate).toBe("2026-12-10T09:00:00+01:00");
    expect(ld.endDate).toBe("2026-12-10T17:00:00+01:00");
    expect(ld.location.name).toBe("Eko Convention Centre");
    expect(ld.location.address.addressLocality).toBe("Lagos");
    expect(ld.location.address.addressCountry).toBe("NG");
  });
  it("is marked rescheduled, with the old start as previousStartDate", () => {
    const ld = eventJsonLd();
    expect(ld.eventStatus).toBe("https://schema.org/EventRescheduled");
    expect(ld.previousStartDate).toBe("2026-11-23T09:00:00+01:00");
  });
});
