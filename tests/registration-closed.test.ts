/**
 * Registration closed (convener, 20 Nov 2026). Guards: one switch, closed by
 * default; every site-wide "Register" button follows it; the deploy script
 * refuses a build with an open /register; the Talent Fund application stays
 * closed; the homepage carries the shortlist straight after the hero.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { shortlistPath } from "@/data/navigation";
import { isRegistrationOpen, registrationClosure, summitCta } from "@/lib/registration-window";
import { applicationWindow } from "@/lib/talent-form";

const ROOT = join(__dirname, "..");
const read = (f: string) => readFileSync(join(ROOT, f), "utf8");

describe("registration switch", () => {
  it("is closed unless the build explicitly reopens it", () => {
    expect(isRegistrationOpen(undefined)).toBe(false);
    expect(isRegistrationOpen("")).toBe(false);
    expect(isRegistrationOpen("closed")).toBe(false);
    expect(isRegistrationOpen("OPEN")).toBe(false);
    expect(isRegistrationOpen("open")).toBe(true);
  });

  it("says when it closed", () => {
    expect(registrationClosure.closedIso).toBe("2026-11-20");
    expect(registrationClosure.closed).toBe("20 November 2026");
    expect(registrationClosure.body).toContain("20 November 2026");
  });

  it("points the site-wide button at the shortlist once closed", () => {
    expect(summitCta(false)).toEqual({
      label: "Check the Talent Fund shortlist",
      shortLabel: "Check the shortlist",
      href: shortlistPath,
    });
    expect(summitCta(true).href).toBe("/register");
  });

  it("production builds never carry the override", () => {
    expect(read(".env.production")).not.toMatch(/REGISTRATION_OVERRIDE/);
    expect(read("scripts/build-cpanel.sh")).toMatch(/unset [^\n]*NEXT_PUBLIC_REGISTRATION_OVERRIDE/);
    expect(read("scripts/build-cpanel.sh")).toContain('data-registration="closed"');
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
