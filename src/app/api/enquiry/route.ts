import { enquirySchema } from "@/lib/enquiry";
import { handleSubmission } from "@/lib/submission-handler";

export async function POST(request: Request) {
  return handleSubmission(request, {
    kind: "enquiry",
    schema: enquirySchema,
    traceLabel: (d) => d.topic,
    unavailableMessage: "Online enquiries are not open yet. Please check back soon.",
  });
}
