import { registrationSchema } from "@/lib/registration";
import { handleSubmission } from "@/lib/submission-handler";

export async function POST(request: Request) {
  return handleSubmission(request, {
    kind: "registration",
    schema: registrationSchema,
    traceLabel: (d) => d.delegateType,
    unavailableMessage: "Online registration is not open yet. Please check back soon.",
  });
}
