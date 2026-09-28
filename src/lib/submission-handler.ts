import "server-only";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { deliverSubmission, type DeliveryEnv, type SubmissionKind } from "@/lib/delivery";
import type { SubmissionResponse } from "@/lib/forms";

const MAX_BODY_BYTES = 10_000;

const json = (body: SubmissionResponse, status: number) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** First message per top-level field. */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

/**
 * Shared POST pipeline: size cap, JSON parse, honeypot, schema validation,
 * webhook delivery, and a stable status-code contract:
 *   200 ok | 400 bad JSON | 413 too large | 422 invalid | 502 delivery failed | 503 not connected
 */
export async function handleSubmission<S extends z.ZodType<Record<string, unknown>>>(
  request: Request,
  options: {
    kind: SubmissionKind;
    schema: S;
    traceLabel: (data: z.infer<S>) => string;
    unavailableMessage: string;
    env?: DeliveryEnv;
    fetchImpl?: typeof fetch;
  },
): Promise<NextResponse> {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json({ ok: false, error: "Submission is too large." }, 413);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  // Honeypot filled: answer like a success so bots learn nothing.
  if (
    payload !== null &&
    typeof payload === "object" &&
    "website" in payload &&
    typeof payload.website === "string" &&
    payload.website.length > 0
  ) {
    return json({ ok: true, reference: "N2-RECEIVED" }, 200);
  }

  const parsed = options.schema.safeParse(payload);
  if (!parsed.success) {
    return json(
      {
        ok: false,
        error: "Please correct the highlighted fields.",
        fieldErrors: toFieldErrors(parsed.error),
      },
      422,
    );
  }

  const { website: _honeypot, ...fields } = parsed.data as Record<string, unknown>;
  void _honeypot;

  const result = await deliverSubmission(
    options.kind,
    fields,
    options.traceLabel(parsed.data),
    options.env,
    options.fetchImpl,
  );

  switch (result.status) {
    case "delivered":
    case "accepted-unconnected":
      return json({ ok: true, reference: result.reference }, 200);
    case "unavailable":
      return json({ ok: false, error: options.unavailableMessage }, 503);
    case "failed":
      return json(
        { ok: false, error: "We could not send your submission. Please try again in a moment." },
        502,
      );
  }
}
