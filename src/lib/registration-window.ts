import { shortlistPath } from "@/data/navigation";

/**
 * Summit registration (/register, the delegate invitation request) is closed.
 * Convener decision, 20 November 2026: stop all registration three days
 * before the summit, and send visitors to the Talent Fund shortlist instead.
 *
 * One switch for the whole site. The central backend refuses the
 * `registration` form from the same date (central-backend
 * config/central.php `nlbs_registration`), so a closed page cannot be
 * bypassed by posting directly. The Talent Fund application closed on
 * 10 November (src/lib/talent-form.ts) and stays closed.
 *
 * NEXT_PUBLIC_REGISTRATION_OVERRIDE=open reopens the form at build time
 * (the e2e build uses it to keep testing the form). build-cpanel.sh unsets it
 * and refuses to ship a build whose /register page is not closed.
 */
export const registrationClosure = {
  closedIso: "2026-11-20",
  closed: "20 November 2026",
  title: "Registration is closed",
  body: "Registration for Nigeria 2.0, the Nigerian Leadership Business Summit 2026, closed on 20 November 2026. Thank you to everyone who requested an invitation.",
};

export function isRegistrationOpen(override: string | undefined): boolean {
  return override === "open";
}

/** Baked in at build time (NEXT_PUBLIC_* is inlined in server and client code alike). */
export const registrationOpen = isRegistrationOpen(process.env.NEXT_PUBLIC_REGISTRATION_OVERRIDE);

export type Cta = { label: string; shortLabel: string; href: string };

/** The site-wide primary call to action: registration while it is open, the shortlist once it closes. */
export function summitCta(open: boolean = registrationOpen): Cta {
  return open
    ? { label: "Register for the Summit", shortLabel: "Register", href: "/register" }
    : { label: "Check the Talent Fund shortlist", shortLabel: "Check the shortlist", href: shortlistPath };
}
