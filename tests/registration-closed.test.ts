/**
 * Delegate registration window. Closed 20 Nov 2026; reopened 23 Nov 2026 when
 * the summit moved to 10 Dec, closing three days before it (00:00 on 7 Dec,
 * Lagos). Guards: one switch with one deadline; every site-wide "Register"
 * button follows it; the deploy script refuses a /register that does not
 * match the deadline; the Talent Fund application stays closed; the homepage
 * carries the shortlist straight after the hero.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { event } from "@/data/event";
import { shortlistPath } from "@/data/navigation";
import { closesAtMs, isRegistrationOpen, registrationClosure, summitCta } from "@/lib/registration-window";
import { applicationWindow } from "@/lib/talent-form";

const ROOT = join(__dirname, "..");
const read = (f: string) => readFileSync(join(ROOT, f), "utf8");
const lagos = (iso: string) => Date.parse(`${iso}+01:00`);
const DAY = 24 * 60 * 60 * 1000;

describe("registration window", () => {
  it("is open now (reopened 23 Nov 2026) and up to the last second of 6 Dec in Lagos", () => {
    expect(isRegistrationOpen(undefined, lagos("2026-11-23T12:00:00"))).toBe(true);
    expect(isRegistrationOpen(undefined, lagos("2026-12-06T23:59:59"))).toBe(true);
  });

  it("closes at 00:00 on 7 Dec 2026 in Lagos (23:00 UTC on 6 Dec) and stays closed", () => {
    expect(closesAtMs).toBe(Date.parse("2026-12-06T23:00:00Z"));
    expect(isRegistrationOpen(undefined, lagos("2026-12-07T00:00:00"))).toBe(false);
    expect(isRegistrationOpen(undefined, lagos("2026-12-10T09:00:00"))).toBe(false);
    expect(isRegistrationOpen("", lagos("2027-01-01T00:00:00"))).toBe(false);
  });

  it("closes three days before the summit (event.ts)", () => {
    expect(lagos(`${event.date.iso}T00:00:00`) - closesAtMs).toBe(3 * DAY);
  });

  it("only the exact override values force it", () => {
    const after = lagos("2026-12-08T12:00:00");
    const before = lagos("2026-11-25T12:00:00");
    expect(isRegistrationOpen("open", after)).toBe(true);
    expect(isRegistrationOpen("closed", before)).toBe(false);
    expect(isRegistrationOpen("OPEN", after)).toBe(false);
    expect(isRegistrationOpen("CLOSED", before)).toBe(true);
  });

  it("states the dates the pages print", () => {
    expect(registrationClosure.lastDayIso).toBe("2026-12-06");
    expect(registrationClosure.lastDay).toBe("6 December 2026");
    expect(registrationClosure.closedIso).toBe("2026-12-07");
    expect(registrationClosure.closed).toBe("7 December 2026");
    expect(registrationClosure.body).toContain("7 December 2026");
  });

  const PHP = "../central-backend/services/api/config/central.php";
  it.skipIf(!existsSync(join(ROOT, PHP)))("matches the central backend deadline", () => {
    const php = read(PHP);
    expect(php).toMatch(/'nlbs_registration' => \[\s*'closes' => '2026-12-07 00:00:00'/);
  });

  it("points the site-wide button at the form while open and the shortlist once closed", () => {
    expect(summitCta(false)).toEqual({
      label: "Check the Talent Fund shortlist",
      shortLabel: "Check the shortlist",
      href: shortlistPath,
    });
    expect(summitCta(true).href).toBe("/register");
  });

  it("the build pins 'now' so server HTML and hydration agree", () => {
    expect(read("next.config.ts")).toMatch(
      /NEXT_PUBLIC_BUILD_TIME: \(process\.env\.NEXT_PUBLIC_BUILD_TIME \?\?= String\(Date\.now\(\)\)\)/,
    );
    expect(read("src/lib/registration-window.ts")).toContain("process.env.NEXT_PUBLIC_BUILD_TIME");
  });

  it("a stale open build swaps the form for the closed notice on the visitor's clock", () => {
    const form = read("src/components/forms/RegistrationForm.tsx");
    expect(form).toContain("Date.now() >= closesAtMs");
    expect(form).toContain('data-registration="closed"');
  });

  it("production builds never carry the override and must match the deadline", () => {
    expect(read(".env.production")).not.toMatch(/REGISTRATION_OVERRIDE/);
    const sh = read("scripts/build-cpanel.sh");
    expect(sh).toMatch(/unset [^\n]*NEXT_PUBLIC_REGISTRATION_OVERRIDE/);
    expect(sh).toContain('data-registration="closed"');
    expect(sh).toContain('data-registration="open"');
    // The script reads closesAt with this sed pattern; keep the source line in that shape.
    expect(read("src/lib/registration-window.ts")).toMatch(/^ *closesAt: "2026-12-07T00:00:00\+01:00",$/m);
  });

  it("the e2e closed build forces it closed", () => {
    const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts["build:e2e:closed"]).toContain("NEXT_PUBLIC_REGISTRATION_OVERRIDE=closed");
    expect(pkg.scripts["build:e2e"]).toContain("NEXT_PUBLIC_REGISTRATION_OVERRIDE=open");
  });
});

describe("every Register button follows the switch", () => {
  it.each([
    "src/components/layout/Header.tsx",
    "src/components/layout/Footer.tsx",
    "src/components/hero/Hero.tsx",
    "src/components/sections/CTASection.tsx",
    "src/app/not-found.tsx",
  ])("%s", (f) => {
    const src = read(f);
    expect(src).toContain("summitCta");
    expect(src).not.toMatch(/href="\/register/);
    expect(src).not.toMatch(/>\s*Register( for the Summit)?\s*</);
  });

  it.each([
    "src/app/investment/page.tsx",
    "src/app/startup-pitch/page.tsx",
    "src/components/sections/StartupPitchSection.tsx",
  ])("%s only links to /register while it is open", (f) => {
    for (const line of read(f)
      .split("\n")
      .filter((l) => l.includes('"/register'))) {
      expect(line, f).toMatch(/registrationOpen \?/);
    }
  });

  it("/register renders the closed notice instead of the form when closed", () => {
    const page = read("src/app/register/page.tsx");
    expect(page).toMatch(/registrationOpen \? <OpenRegistration \/> : <ClosedRegistration \/>/);
    expect(page).toContain('data-registration="closed"');
    expect(page).toContain('data-registration="open"');
    // The form lives only in the open branch.
    const closed = page.slice(
      page.indexOf("function ClosedRegistration"),
      page.indexOf("function OpenRegistration"),
    );
    expect(closed).not.toContain("RegistrationForm");
  });
});

describe("talent fund application", () => {
  it("stays closed after 10 November 2026 (Lagos)", () => {
    expect(applicationWindow(Date.parse("2026-11-20T09:00:00+01:00"))).toBe("closed");
    expect(applicationWindow(Date.parse("2027-01-01T00:00:00+01:00"))).toBe("closed");
  });
});

describe("homepage", () => {
  it("shows the shortlist straight after the hero, and the hero button scrolls to it", () => {
    const page = read("src/app/page.tsx");
    expect(page).toMatch(/<Hero \/>\s*<ShortlistSection \/>/);
    const section = read("src/components/sections/ShortlistSection.tsx");
    expect(section).toContain('id="shortlist"');
    expect(section).toContain("<ShortlistFinder />");
    expect(read("src/components/hero/Hero.tsx")).toContain('"#shortlist"');
  });
});
