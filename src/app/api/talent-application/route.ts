import {
  applicationWindow,
  eligibility,
  NOT_ELIGIBLE,
  normalizeNigerianMobile,
  screen,
  stripOtherTracks,
  talentApplicationSchema,
} from "@/lib/talent-form";
import { handleSubmission } from "@/lib/submission-handler";

/** 3 MB: a 2 MB PDF CV grows by a third as base64, plus the form fields. */
const MAX_BYTES = 3 * 1024 * 1024;

export async function POST(request: Request) {
  const status = applicationWindow(Date.now(), process.env.TALENT_APPLICATIONS_OVERRIDE);
  if (status !== "open") {
    return Response.json(
      {
        ok: false,
        error:
          status === "upcoming"
            ? "Applications open on 1 October 2026."
            : "Applications for the 2026 Talent Fund have closed.",
      },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  return handleSubmission(request, {
    kind: "talent",
    schema: talentApplicationSchema,
    maxBytes: MAX_BYTES,
    traceLabel: (d) => `${d.track}/${d.state}`,
    unavailableMessage: "Online applications are not open yet. Please check back soon.",
    prepare: (d) => {
      if (!eligibility(d).eligible) return { ok: false, status: 422, error: NOT_ELIGIBLE };
      const clean = stripOtherTracks(d);
      return {
        ok: true,
        fields: {
          ...clean,
          whatsapp: normalizeNigerianMobile(clean.whatsapp),
          screening: screen(clean),
        },
      };
    },
  });
}
