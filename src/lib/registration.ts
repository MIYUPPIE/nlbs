import { z } from "zod";

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

export const registrationSchema = z.object({
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
  /** Honeypot. Real users never see or fill this field. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

/** Human-readable reference, e.g. N2-7K4Q-9XPA. */
export function createReference(random: () => number = Math.random): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const chunk = () =>
    Array.from({ length: 4 }, () => alphabet[Math.floor(random() * alphabet.length)]).join("");
  return `N2-${chunk()}-${chunk()}`;
}
