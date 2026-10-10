import { z } from "zod";
import { universityBySlug } from "@/data/universities";
import { base64Bytes, looksLikePdf } from "@/lib/talent-form";

/**
 * A university confirms it is taking part in the Talent Fund
 * (/talentnigeria20/universities/<slug>). Posted from the browser as form
 * "university" (central-backend App\Forms\Nlbs\UniversityPartnerForm,
 * fixture contracts/fixtures/nlbs-university.json). It carries the Career
 * Services contact only: students are never listed here, each applies and
 * consents for themselves through /talentnigeria20.
 */

export const LETTERHEAD_MAX_BYTES = 2 * 1024 * 1024;

export const letterheadSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.literal("application/pdf", { error: "The letter must be a PDF." }),
  size: z.number().int().positive().max(LETTERHEAD_MAX_BYTES, "The letter must be 2 MB or smaller."),
  data: z
    .string()
    .refine(looksLikePdf, "The letter must be a PDF.")
    .refine((d) => base64Bytes(d) <= LETTERHEAD_MAX_BYTES, "The letter must be 2 MB or smaller."),
});

export type LetterheadUpload = z.infer<typeof letterheadSchema>;

const req = (label: string, max: number) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

export const universityFormSchema = z.object({
  university: z.string().refine((s) => universityBySlug(s) !== undefined, "Select your university."),
  focalName: req("Full name", 100).refine((v) => v.length >= 2, "Full name is required."),
  focalTitle: req("Job title", 120),
  email: req("Work email", 254).pipe(z.email("Enter a valid email address.")),
  phone: req("Phone number", 20).refine(
    (v) => v.replace(/\D/g, "").length >= 7,
    "Enter a phone number we can call.",
  ),
  expectedNominees: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 2000),
      "Enter a number from 1 to 2,000, or leave it blank.",
    )
    .optional()
    .default(""),
  letterhead: letterheadSchema.nullable().optional(),
  message: z
    .string()
    .trim()
    .max(2000, "Keep the message to 2,000 characters or fewer.")
    .optional()
    .default(""),
  consent: z.literal(true, { error: "Please confirm you may share these details." }),
  website: z.string().max(0).optional().or(z.literal("")),
});

export type UniversityFormInput = z.infer<typeof universityFormSchema>;

/** The exact body sent to the backend: a number for the nominee estimate, null when no letter. */
export function universityPayload(d: UniversityFormInput): Record<string, unknown> {
  return {
    ...d,
    expectedNominees: d.expectedNominees === "" ? null : Number(d.expectedNominees),
    letterhead: d.letterhead ?? null,
  };
}
