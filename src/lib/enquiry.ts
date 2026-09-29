import { z } from "zod";

/** Enquiry contract, shared by the contact form and /api/enquiry. */

export const enquiryTopics = [
  "General enquiry",
  "Partnership",
  "Sponsorship",
  "Exhibition",
  "Startup Pitch Arena",
  "Investment",
  "Talent Fund",
  "Speaking",
  "Media",
] as const;

export type EnquiryTopic = (typeof enquiryTopics)[number];

export const enquirySchema = z.object({
  fullName: z
    .string({ error: "Full name is required." })
    .trim()
    .min(2, "Full name is required.")
    .max(100, "Full name must be 100 characters or fewer."),
  email: z
    .string({ error: "Email address is required." })
    .trim()
    .min(1, "Email address is required.")
    .max(254, "Email address is too long.")
    .pipe(z.email("Enter a valid email address.")),
  organisation: z
    .string()
    .trim()
    .max(120, "Organisation must be 120 characters or fewer.")
    .optional()
    .default(""),
  topic: z.enum(enquiryTopics, { error: "Select a topic." }),
  message: z
    .string({ error: "Message is required." })
    .trim()
    .min(10, "Please share a little more detail (at least 10 characters).")
    .max(2000, "Message must be 2,000 characters or fewer."),
  website: z.string().max(0).optional().or(z.literal("")),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

/** Maps a `?topic=` query value to a known topic, or null. */
export function topicFromQuery(value: string | string[] | undefined): EnquiryTopic | null {
  const v = Array.isArray(value) ? value[0] : value;
  if (!v) return null;
  const slug = v.toLowerCase();
  const map: Record<string, EnquiryTopic> = {
    partnership: "Partnership",
    stakeholder: "Partnership",
    sponsorship: "Sponsorship",
    sponsor: "Sponsorship",
    exhibition: "Exhibition",
    pitch: "Startup Pitch Arena",
    investment: "Investment",
    talent: "Talent Fund",
    speaking: "Speaking",
    media: "Media",
  };
  return map[slug] ?? null;
}

/** Contact link for a partnership track: Stakeholders are "Partnership", Sponsors "Sponsorship". */
export function enquiryHref(track: "stakeholder" | "sponsor"): string {
  return `/contact?topic=${track === "stakeholder" ? "partnership" : "sponsorship"}`;
}
