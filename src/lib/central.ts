import type { SubmissionResponse } from "@/lib/forms";
import { PRIVACY_VERSION } from "@/lib/privacy";

/**
 * Sends a form straight from the visitor's browser to the central backend
 * (central-backend, contracts/submissions.v1.md). The site is a static export
 * with no server of its own, so this replaces the old /api routes.
 *
 *   NEXT_PUBLIC_CENTRAL_API_URL   e.g. https://api.nlbs.com.ng
 *   NEXT_PUBLIC_CENTRAL_SITE_KEY  the NLBS public key (pk_...). Public by
 *                                 design: the backend only accepts it from
 *                                 the site's own origins, rate-limited.
 *
 * Both are baked in at build time. Without them the forms say they are not
 * open yet rather than pretending to succeed.
 */

export type CentralForm = "registration" | "enquiry" | "talent" | "sponsor" | "university" | "privacy";

export type CentralConfig = { apiUrl: string; siteKey: string };

export function centralConfig(
  env: Record<string, string | undefined> = {
    NEXT_PUBLIC_CENTRAL_API_URL: process.env.NEXT_PUBLIC_CENTRAL_API_URL,
    NEXT_PUBLIC_CENTRAL_SITE_KEY: process.env.NEXT_PUBLIC_CENTRAL_SITE_KEY,
  },
): CentralConfig | null {
  const apiUrl = env.NEXT_PUBLIC_CENTRAL_API_URL?.trim().replace(/\/+$/, "");
  const siteKey = env.NEXT_PUBLIC_CENTRAL_SITE_KEY?.trim();
  if (!apiUrl || !siteKey || !/^https?:\/\//.test(apiUrl) || !siteKey.startsWith("pk_")) return null;
  return { apiUrl, siteKey };
}

export const NOT_OPEN: Record<CentralForm, string> = {
  registration: "Online registration is not open yet. Please check back soon.",
  enquiry: "The contact form is not open yet. Please email us instead.",
  talent: "Online applications are not open yet. Please check back soon.",
  sponsor: "The partner form is not connected yet. Please contact the convener's office.",
  university: "The confirmation form is not connected yet. Please email info@nlbs.com.ng instead.",
  privacy: "The privacy request form is not connected yet. Please email our Data Protection Officer instead.",
};

const GENERIC = "We could not send your submission. Please try again in a moment.";

/** Human message for statuses the backend answers without a useful error. */
function messageFor(status: number, form: CentralForm): string {
  if (status === 429) return "Too many attempts from your connection. Please wait a minute and try again.";
  if (status === 413) return "Your submission is too large. Please use a smaller file.";
  if (status === 401 || status === 404) return NOT_OPEN[form];
  return GENERIC;
}

export async function submitToCentral(
  form: CentralForm,
  fields: Record<string, unknown>,
  config: CentralConfig | null = centralConfig(),
  fetchImpl: typeof fetch = fetch,
): Promise<SubmissionResponse> {
  if (!config) return { ok: false, error: NOT_OPEN[form] };

  let res: Response;
  try {
    res = await fetchImpl(`${config.apiUrl}/api/v1/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Site-Key": config.siteKey,
      },
      // privacyVersion: the privacy policy shown to the visitor (stored as proof of notice).
      body: JSON.stringify({ ...fields, form, privacyVersion: PRIVACY_VERSION }),
    });
  } catch {
    return { ok: false, error: "We could not reach the server. Check your connection and try again." };
  }

  const data = (await res.json().catch(() => null)) as {
    ok?: unknown;
    reference?: unknown;
    error?: unknown;
    fieldErrors?: unknown;
  } | null;

  if (res.ok && data?.ok === true && typeof data.reference === "string") {
    return { ok: true, reference: data.reference };
  }
  if (res.status === 422 && data && typeof data.fieldErrors === "object" && data.fieldErrors) {
    return {
      ok: false,
      error: typeof data.error === "string" ? data.error : "Please correct the highlighted fields.",
      fieldErrors: data.fieldErrors as Record<string, string>,
    };
  }
  // 403 carries a meaningful message for closed windows ("Applications ... have closed").
  if (res.status === 403 && typeof data?.error === "string" && !/origin|browser|inactive/i.test(data.error)) {
    return { ok: false, error: data.error };
  }
  return { ok: false, error: messageFor(res.status, form) };
}

export type UniversityStat = {
  slug: string;
  status: "invited" | "received" | "confirmed";
  applications: number;
};

/**
 * Each invited university's status and how many Talent Fund applications name
 * it (GET /api/v1/talent/universities, aggregates only). Null when the backend
 * is unreachable or not configured: the pages then say so instead of showing
 * a number.
 */
export async function fetchUniversityStats(
  config: CentralConfig | null = centralConfig(),
  fetchImpl: typeof fetch = fetch,
): Promise<Map<string, UniversityStat> | null> {
  if (!config) return null;
  try {
    const res = await fetchImpl(`${config.apiUrl}/api/v1/talent/universities`, {
      headers: { Accept: "application/json", "X-Site-Key": config.siteKey },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok?: unknown; universities?: unknown };
    if (data.ok !== true || !Array.isArray(data.universities)) return null;
    const out = new Map<string, UniversityStat>();
    for (const u of data.universities as UniversityStat[]) {
      if (
        typeof u?.slug === "string" &&
        ["invited", "received", "confirmed"].includes(u.status) &&
        Number.isInteger(u.applications) &&
        u.applications >= 0
      )
        out.set(u.slug, { slug: u.slug, status: u.status, applications: u.applications });
    }
    return out;
  } catch {
    return null;
  }
}
