import type { SubmissionResponse } from "@/lib/forms";

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

export type CentralForm = "registration" | "enquiry" | "talent" | "sponsor";

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
      body: JSON.stringify({ ...fields, form }),
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

export type PreorderCheck =
  | { valid: true; seatsLeft?: number }
  | { valid: false; message: string; status?: "not_found" | "unpaid" | "used_up" | "error" };

/**
 * Confirms a paid book pre-order for a Talent Fund applicant before they
 * continue (GET /api/v1/talent/preorder-check). The backend enforces the
 * same rule again when the application is submitted.
 */
export async function checkPreorder(
  reference: string,
  applicant: { email: string; whatsapp: string },
  config: CentralConfig | null = centralConfig(),
  fetchImpl: typeof fetch = fetch,
): Promise<PreorderCheck> {
  if (!config) return { valid: false, status: "error", message: NOT_OPEN.talent };
  const q = new URLSearchParams({ reference, email: applicant.email, phone: applicant.whatsapp });

  let res: Response;
  try {
    res = await fetchImpl(`${config.apiUrl}/api/v1/talent/preorder-check?${q.toString()}`, {
      headers: { Accept: "application/json", "X-Site-Key": config.siteKey },
    });
  } catch {
    return {
      valid: false,
      status: "error",
      message: "We could not reach the server. Check your connection and try again.",
    };
  }

  const data = (await res.json().catch(() => null)) as {
    valid?: unknown;
    seatsLeft?: unknown;
    status?: unknown;
    message?: unknown;
  } | null;

  if (res.ok && data?.valid === true) {
    return typeof data.seatsLeft === "number" ? { valid: true, seatsLeft: data.seatsLeft } : { valid: true };
  }
  if (res.ok && data?.valid === false && typeof data.message === "string") {
    const status = ["not_found", "unpaid", "used_up"].includes(data.status as string)
      ? (data.status as "not_found" | "unpaid" | "used_up")
      : undefined;
    return { valid: false, status, message: data.message };
  }
  return { valid: false, status: "error", message: messageFor(res.status, "talent") };
}
