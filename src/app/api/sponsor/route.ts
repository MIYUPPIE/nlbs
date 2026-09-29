import { NextResponse } from "next/server";
import { sponsorAccessAllowed } from "@/lib/sponsor-access";
import { parsePassHolders, passLimit, sponsorFormSchema } from "@/lib/sponsor-form";
import { handleSubmission } from "@/lib/submission-handler";

const MAX_BYTES = 20_000;

const notFound = () =>
  NextResponse.json(
    { ok: false, error: "Not found." },
    { status: 404, headers: { "Cache-Control": "no-store" } },
  );

/** Private partner booking form. Without the link's token the endpoint does not exist. */
export async function POST(request: Request) {
  const raw = await request.clone().text();
  let token: unknown = null;
  if (raw.length <= MAX_BYTES) {
    try {
      token = (JSON.parse(raw) as { accessToken?: unknown } | null)?.accessToken;
    } catch {
      token = null;
    }
  }
  if (!sponsorAccessAllowed(token)) return notFound();

  return handleSubmission(request, {
    kind: "sponsor",
    schema: sponsorFormSchema,
    maxBytes: MAX_BYTES,
    traceLabel: (d) => `${d.track}/${d.tier}`,
    unavailableMessage: "The partner form is not connected yet. Please contact the convener's office.",
    prepare: (d) => {
      const { accessToken: _token, acknowledge: _ack, passHolders, ...fields } = d;
      void _token;
      void _ack;
      return {
        ok: true,
        fields: {
          ...fields,
          passHolders: parsePassHolders(passHolders).holders,
          passAllowance: passLimit(d.track, d.tier),
        },
      };
    },
  });
}
