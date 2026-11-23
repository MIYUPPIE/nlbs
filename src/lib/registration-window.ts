import { shortlistPath } from "@/data/navigation";

/**
 * Summit registration (/register, the delegate invitation request).
 *
 * History: closed on 20 November 2026, three days before the original summit
 * date (event.reschedule). The summit moved to Thursday 10 December 2026, so
 * registration reopened under the same rule: it closes three days before the
 * summit, at 00:00 on 7 December 2026, Lagos time.
 *
 * One switch for the whole site. The central backend refuses the
 * `registration` form from the same instant (central-backend
 * config/central.php `nlbs_registration.closes`), so a stale page cannot be
 * bypassed by posting directly. The Talent Fund application closed on
 * 10 November (src/lib/talent-form.ts) and stays closed.
 *
 * The site is a static export, so the open/closed state is fixed when it is
 * built (next.config.ts inlines the build time). RegistrationForm also checks
 * the visitor's clock, so a build made before the deadline swaps the form for
 * the closed notice once the deadline passes. build-cpanel.sh refuses to ship
 * a build whose /register state does not match the deadline.
 *
 * NEXT_PUBLIC_REGISTRATION_OVERRIDE=open|closed forces the state (e2e only;
 * build-cpanel.sh unsets it).
 */
export const registrationClosure = {
  /** 00:00 on 7 December 2026 in Lagos (WAT, UTC+1). Mirrors central-backend `nlbs_registration.closes`. */
  closesAt: "2026-12-07T00:00:00+01:00",
  lastDayIso: "2026-12-06",
  lastDay: "6 December 2026",
  closedIso: "2026-12-07",
  closed: "7 December 2026",
  title: "Registration is closed",
  body: "Registration for Nigeria 2.0, the Nigerian Leadership Business Summit 2026, closed on 7 December 2026. Thank you to everyone who requested an invitation.",
} as const;

export const closesAtMs = Date.parse(registrationClosure.closesAt);

export function isRegistrationOpen(override: string | undefined, now: number): boolean {
  if (override === "open") return true;
  if (override === "closed") return false;
  return now < closesAtMs;
}

/**
 * Baked in at build time: NEXT_PUBLIC_* and the build time (next.config.ts)
 * are inlined in server and client code alike, so server HTML and hydration agree.
 */
export const registrationOpen = isRegistrationOpen(
  process.env.NEXT_PUBLIC_REGISTRATION_OVERRIDE,
  Number(process.env.NEXT_PUBLIC_BUILD_TIME ?? Date.now()),
);

export type Cta = { label: string; shortLabel: string; href: string };

/** The site-wide primary call to action: registration while it is open, the shortlist once it closes. */
export function summitCta(open: boolean = registrationOpen): Cta {
  return open
    ? { label: "Register for the Summit", shortLabel: "Register", href: "/register" }
    : { label: "Check the Talent Fund shortlist", shortLabel: "Check the shortlist", href: shortlistPath };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Whole Lagos days left to register, counting today: 14 two weeks out, 1 on
 * 6 Dec (the last day), 0 from 00:00 on 7 Dec.
 */
export function registrationDaysLeft(now: number): number {
  if (now >= closesAtMs) return 0;
  return Math.ceil((closesAtMs - now) / DAY_MS);
}

/** "14 days left", "2 days left", "Last day to register", or null once closed. */
export function daysLeftLabel(days: number): string | null {
  if (days <= 0) return null;
  if (days === 1) return "Last day to register";
  return `${days} days left`;
}
