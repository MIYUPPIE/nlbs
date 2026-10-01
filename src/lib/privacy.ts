import { z } from "zod";
import legal from "@/data/legal.json";

/**
 * Privacy policy facts and the data subject request form.
 *
 * src/data/legal.json is generated: central-backend/contracts/privacy
 * (policy.v1.json -> build.mjs -> dist/nlbs/legal.json), copied here by
 * `node ../tools/sync-legal.mjs nlbs`. Never edit it by hand;
 * tests/legal.test.ts fails if it drifts from the backend's copy.
 */

export type LegalDocKey = "privacy" | "cookies" | "terms";

export type LegalDoc = {
  title: string;
  updated: string;
  toc: { id: string; heading: string }[];
  html: string;
};

export const LEGAL = legal as {
  version: string;
  effectiveDate: string;
  docs: Record<LegalDocKey, LegalDoc>;
  facts: {
    version: string;
    controller: string;
    dpoEmail: string;
    regulatorName: string;
    regulatorEmail: string;
    responseDays: number;
    requestKeptFor: string;
    paths: { privacy: string; cookies: string; terms: string; request: string };
    storage: string[];
    thirdPartyOrigins: string[];
  };
};

/** Sent with every form as `privacyVersion`: which policy the visitor was shown (backend meta.privacy_version). */
export const PRIVACY_VERSION = LEGAL.version;

export const PRIVACY_PATHS = LEGAL.facts.paths;

/**
 * The rights a visitor can ask for. Keys are the backend contract
 * (central-backend App\Forms\PrivacyRequestForm::TYPES), labels the same words.
 */
export const REQUEST_TYPES = [
  { value: "access", label: "Get a copy of my data" },
  { value: "correction", label: "Correct my data" },
  { value: "deletion", label: "Delete my data" },
  { value: "restriction", label: "Restrict how my data is used" },
  { value: "objection", label: "Object to how my data is used" },
  { value: "portability", label: "Send me my data in a portable format" },
  { value: "withdraw_consent", label: "Withdraw my consent" },
  { value: "automated_review", label: "Review an automated decision" },
  { value: "other", label: "Another privacy question" },
] as const;

export type RequestType = (typeof REQUEST_TYPES)[number]["value"];

const TYPE_VALUES = REQUEST_TYPES.map((t) => t.value) as [RequestType, ...RequestType[]];

/** Request types we cannot act on without details (same rule as the backend). */
export const NEEDS_DETAILS: RequestType[] = ["correction", "objection", "automated_review", "other"];

export const privacyRequestSchema = z
  .object({
    fullName: z
      .string({ error: "Please enter your full name." })
      .trim()
      .min(2, "Please enter your full name.")
      .max(100, "Full name must be 100 characters or fewer."),
    email: z
      .string({ error: "Please enter the email address you used with us." })
      .trim()
      .min(1, "Please enter the email address you used with us.")
      .max(254, "Email address is too long.")
      .pipe(z.email("Please enter a valid email address.")),
    phone: z
      .string()
      .trim()
      .max(30)
      .optional()
      .default("")
      .refine((v) => v === "" || /^\+?[0-9\s\-().]{7,30}$/.test(v), "Enter a valid phone number."),
    requestType: z.enum(TYPE_VALUES, { error: "Choose what you would like us to do." }),
    reference: z.string().trim().max(40, "References are at most 40 characters.").optional().default(""),
    details: z.string().trim().max(3000, "Keep it to 3,000 characters or fewer.").optional().default(""),
    /** "yes" when ticked. Checked in superRefine so it is reported together with `details`. */
    confirm: z.string().optional().default(""),
    website: z.string().max(0).optional().or(z.literal("")),
  })
  .superRefine((d, ctx) => {
    if (d.confirm !== "yes") {
      ctx.addIssue({
        code: "custom",
        path: ["confirm"],
        message: "Please confirm the data is about you, or that you may act for the person.",
      });
    }
    if (NEEDS_DETAILS.includes(d.requestType) && d.details.length < 10) {
      ctx.addIssue({
        code: "custom",
        path: ["details"],
        message: "Tell us a little more so we can act on your request.",
      });
    }
  });

/** Validated form values -> the backend payload (contracts/fixtures/privacy-request.json). */
export function privacyRequestPayload(d: z.infer<typeof privacyRequestSchema>): Record<string, unknown> {
  return {
    fullName: d.fullName,
    email: d.email,
    phone: d.phone,
    requestType: d.requestType,
    reference: d.reference,
    details: d.details,
    confirm: true,
    website: d.website ?? "",
  };
}
