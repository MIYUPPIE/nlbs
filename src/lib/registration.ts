import { z } from "zod";
import { seatPayment } from "@/data/registration-plan";

/**
 * Registration contract. Shared by the client form and the /api/register
 * route so both sides validate identically.
 */

export const delegateTypes = [
  "Government",
  "Business",
  "Investor",
  "Startup",
  "Development Organisation",
  "Technology",
  "Media",
  "Student / Young Professional",
  "Other",
] as const;

export const sectors = [
  "Government & Public Sector",
  "Banking & Financial Services",
  "Investment & Private Capital",
  "Technology & Telecommunications",
  "Manufacturing & Industry",
  "Agriculture & Agribusiness",
  "Energy & Natural Resources",
  "Health",
  "Education",
  "Media & Creative Industries",
  "Professional Services",
  "Development & Non-profit",
  "Other",
] as const;

const requiredText = (label: string, max = 120) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(2, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

const phonePattern = /^\+?[0-9\s\-().]{7,20}$/;

const optionalText = (label: string, max: number) =>
  z.string().trim().max(max, `${label} must be ${max} characters or fewer.`).optional().default("");

/** Guest n of the order (1-based): flat form fields, sent as `guests: [{fullName, email}]`. */
export const guestNameKey = (n: number) => `guest${n}Name`;
export const guestEmailKey = (n: number) => `guest${n}Email`;

const guestFields = Object.fromEntries(
  Array.from({ length: seatPayment.maxSeats - 1 }, (_, i) => [
    [
      guestNameKey(i + 1),
      z.string().trim().max(100, "Name must be 100 characters or fewer.").optional().default(""),
    ],
    [guestEmailKey(i + 1), z.string().trim().max(254, "Email address is too long.").optional().default("")],
  ]).flat(),
) as Record<string, z.ZodDefault<z.ZodOptional<z.ZodString>>>;

/** "3" -> 3; anything odd -> 1. Never more than the per-order maximum. */
export function seatCount(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? Math.min(n, seatPayment.maxSeats) : 1;
}

/** The guests on an order, in seat order, from the flat form values. */
export function guestsFrom(values: Record<string, string>): { fullName: string; email: string }[] {
  return Array.from({ length: seatCount(values.seats) - 1 }, (_, i) => ({
    fullName: (values[guestNameKey(i + 1)] ?? "").trim().replace(/\s+/g, " "),
    email: (values[guestEmailKey(i + 1)] ?? "").trim().toLowerCase(),
  }));
}

export const registrationSchema = z
  .object({
    fullName: requiredText("Full name", 100),
    email: z
      .string({ error: "Email address is required." })
      .trim()
      .min(1, "Email address is required.")
      .max(254, "Email address is too long.")
      .pipe(z.email("Enter a valid email address.")),
    phone: z
      .string({ error: "Phone number is required." })
      .trim()
      .min(1, "Phone number is required.")
      .regex(phonePattern, "Enter a valid phone number, including country code if outside Nigeria.")
      .refine((v) => (v.match(/\d/g) ?? []).length >= 7, "Enter a valid phone number."),
    organisation: requiredText("Organisation"),
    jobTitle: requiredText("Job title"),
    sector: z.enum(sectors, { error: "Select your sector." }),
    country: requiredText("Country", 80),
    delegateType: z.enum(delegateTypes, { error: "Select a delegate type." }),
    /** Optional extras from the registration plan. Blank WhatsApp means "same as phone". */
    whatsapp: z
      .string()
      .trim()
      .optional()
      .default("")
      .refine(
        (v) => v === "" || (phonePattern.test(v) && (v.match(/\d/g) ?? []).length >= 7),
        "Enter a valid WhatsApp number, or leave it blank if it is your phone number.",
      ),
    nominatedBy: optionalText("Nominated by", 120),
    accessNeeds: optionalText("Dietary or access needs", 300),
    /**
     * Explicit consent ("yes") to use dietary/access needs: they can reveal
     * health or religion, sensitive data under the NDPA. Required only when
     * accessNeeds is filled in (the backend enforces the same rule).
     */
    accessNeedsConsent: z.string().optional().default(""),
    /** Seats on this order: you plus guests ("1" to "20"). Each seat is paid. */
    seats: z
      .string()
      .optional()
      .default("1")
      .refine(
        (v) => /^\d+$/.test(v) && +v >= 1 && +v <= seatPayment.maxSeats,
        `Choose 1 to ${seatPayment.maxSeats} seats.`,
      ),
    ...guestFields,
    /** Honeypot. Real users never see or fill this field. */
    website: z.string().max(0).optional().or(z.literal("")),
  })
  .superRefine((d, ctx) => {
    if (d.accessNeeds !== "" && d.accessNeedsConsent !== "yes") {
      ctx.addIssue({ code: "custom", path: ["accessNeedsConsent"], message: ACCESS_CONSENT_MESSAGE });
    }
    // Every guest seat needs a name and its own email (each guest gets their own confirmation).
    const seen = new Set([d.email.trim().toLowerCase()]);
    const values = d as unknown as Record<string, string>;
    for (let n = 1; n < seatCount(values.seats); n++) {
      const name = (values[`guest${n}Name`] ?? "").trim();
      const email = (values[`guest${n}Email`] ?? "").trim().toLowerCase();
      if (name.length < 2) {
        ctx.addIssue({ code: "custom", path: [`guest${n}Name`], message: `Enter guest ${n}'s full name.` });
      }
      if (!z.email().safeParse(email).success) {
        ctx.addIssue({
          code: "custom",
          path: [`guest${n}Email`],
          message: `Enter a valid email for guest ${n}.`,
        });
      } else if (seen.has(email)) {
        ctx.addIssue({
          code: "custom",
          path: [`guest${n}Email`],
          message: "Each person needs their own email address.",
        });
      }
      seen.add(email);
    }
  });

/** Same words as the backend (RegistrationForm::ACCESS_CONSENT_MESSAGE). */
export const ACCESS_CONSENT_MESSAGE =
  "Tick the box to let us use your dietary or access needs, or leave that field blank.";

export type RegistrationInput = z.infer<typeof registrationSchema>;

/** Human-readable reference, e.g. N2-7K4Q-9XPA. */
export function createReference(random: () => number = Math.random): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const chunk = () =>
    Array.from({ length: 4 }, () => alphabet[Math.floor(random() * alphabet.length)]).join("");
  return `N2-${chunk()}-${chunk()}`;
}
