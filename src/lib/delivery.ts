import "server-only";
import { createReference } from "@/lib/registration";

/**
 * Delivery adapter for form submissions. The site ships without a backend,
 * so each form forwards to a webhook configured by environment variables:
 *
 *   <PREFIX>_WEBHOOK_URL        POST target (CRM, Zapier, Make, Sheets, own API)
 *   <PREFIX>_WEBHOOK_SECRET     optional, sent as `Authorization: Bearer <secret>`
 *   <PREFIX>_ALLOW_UNCONNECTED  "true" accepts submissions with no webhook
 *                               (demo/staging only)
 *
 * PREFIX is REGISTRATION or ENQUIRY. With no webhook in production the
 * adapter refuses submissions rather than confirming data that went nowhere.
 */

export type SubmissionKind = "registration" | "enquiry";

export type DeliveryEnv = Record<string, string | undefined>;

export type DeliveryResult =
  | { status: "delivered"; reference: string }
  | { status: "accepted-unconnected"; reference: string }
  | { status: "unavailable" }
  | { status: "failed"; reason: string };

const WEBHOOK_TIMEOUT_MS = 8_000;

const secureRandom = () => {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 2 ** 32;
};

export async function deliverSubmission(
  kind: SubmissionKind,
  fields: Record<string, unknown>,
  /** Short non-personal label for logs, e.g. the delegate type. */
  traceLabel: string,
  env: DeliveryEnv = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<DeliveryResult> {
  const prefix = kind.toUpperCase();
  const reference = createReference(secureRandom);
  const webhook = env[`${prefix}_WEBHOOK_URL`]?.trim();

  if (!webhook) {
    const allowed = env.NODE_ENV !== "production" || env[`${prefix}_ALLOW_UNCONNECTED`] === "true";
    if (!allowed) {
      console.warn(`[${kind}] refused: no ${prefix}_WEBHOOK_URL configured`);
      return { status: "unavailable" };
    }
    console.info(`[${kind}] accepted without webhook ref=${reference} label=${traceLabel}`);
    return { status: "accepted-unconnected", reference };
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const secret = env[`${prefix}_WEBHOOK_SECRET`];
  if (secret) headers.Authorization = `Bearer ${secret}`;

  try {
    const res = await fetchImpl(webhook, {
      method: "POST",
      headers,
      body: JSON.stringify({
        kind,
        reference,
        submittedAt: new Date().toISOString(),
        event: "nigeria-2-0-2026",
        ...fields,
      }),
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`[${kind}] webhook responded ${res.status} ref=${reference}`);
      return { status: "failed", reason: `webhook ${res.status}` };
    }
    console.info(`[${kind}] delivered ref=${reference} label=${traceLabel}`);
    return { status: "delivered", reference };
  } catch (err) {
    const reason = err instanceof Error ? err.name : "unknown";
    console.error(`[${kind}] webhook error ${reason} ref=${reference}`);
    return { status: "failed", reason };
  }
}
