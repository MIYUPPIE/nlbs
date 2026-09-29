import { parsePassHolders, passLimit, sponsorFormSchema } from "@/lib/sponsor-form";
import { handleSubmission } from "@/lib/submission-handler";

const MAX_BYTES = 20_000;

/** Partner booking form (/sponsors). */
export async function POST(request: Request) {
  return handleSubmission(request, {
    kind: "sponsor",
    schema: sponsorFormSchema,
    maxBytes: MAX_BYTES,
    traceLabel: (d) => `${d.track}/${d.tier}`,
    unavailableMessage: "The partner form is not connected yet. Please contact the convener's office.",
    prepare: (d) => {
      const { acknowledge: _ack, passHolders, ...fields } = d;
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
