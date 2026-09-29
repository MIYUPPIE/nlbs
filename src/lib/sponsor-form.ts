import { z } from "zod";
import { sponsorBenefits, trackById, tracks, type TrackId } from "@/data/partnership";
import { sectors } from "@/lib/registration";

/**
 * Private partner booking form (/sponsor/<token>). Shared by the client form
 * and /api/sponsor. Follows the prospectus "What happens next": confirm a
 * package, book the 15-minute strategy call, then contract and invoice.
 */

export const TRACK_OPTIONS = tracks.map((t) => t.title) as [string, ...string[]];

export const trackIdFor = (title: string): TrackId | null =>
  tracks.find((t) => t.title === title)?.id ?? null;

export const tierOptions = (trackTitle: string): string[] => {
  const id = trackIdFor(trackTitle);
  return id ? trackById(id).tiers.map((t) => t.name) : [];
};

/**
 * Stakeholder pass allowances are not in the prospectus; the registration
 * plan says partners get 4 to 10 VIP passes, so 10 is the ceiling here and
 * the agreement sets the final number.
 */
export const STAKEHOLDER_PASS_CAP = 10;

/** VIP passes for a tier: sponsor tiers from the benefits table, stakeholders capped. */
export function passLimit(trackTitle: string, tier: string): number {
  const id = trackIdFor(trackTitle);
  if (id === "stakeholder") return STAKEHOLDER_PASS_CAP;
  if (id !== "sponsor") return 0;
  const i = trackById("sponsor").tiers.findIndex((t) => t.name === tier);
  const row = sponsorBenefits.flatMap((g) => g.rows).find((r) => r.benefit === "VIP delegate passes");
  return i >= 0 && row ? Number(row.values[i] ?? 0) : 0;
}

export type PassHolder = { name: string; email: string };

const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;

/** "Ada Obi, ada@example.com" per line (comma, semicolon or tab). Blank lines ignored. */
export function parsePassHolders(text: string): { holders: PassHolder[]; error: string | null } {
  const holders: PassHolder[] = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const m = /^(.+?)\s*[,;\t]\s*(\S+)$/.exec(line);
    if (!m || m[1].length < 2 || !EMAIL.test(m[2])) {
      return { holders, error: `Line ${i + 1}: use "Full name, email@example.com".` };
    }
    holders.push({ name: m[1], email: m[2].toLowerCase() });
  }
  return { holders, error: null };
}

const req = (label: string, max: number) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(2, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

const opt = (label: string, max: number) =>
  z.string().trim().max(max, `${label} must be ${max} characters or fewer.`).optional().default("");

const phonePattern = /^\+?[0-9\s\-().]{7,20}$/;
const validPhone = (v: string) => phonePattern.test(v) && (v.match(/\d/g) ?? []).length >= 7;

export const sponsorFormSchema = z
  .object({
    // Organisation
    companyName: req("Company name", 120),
    industry: z.enum(sectors, { error: "Select your industry." }),
    companyWebsite: opt("Website", 200).refine(
      (v) => v === "" || /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(v),
      "Enter a full web address starting with https://",
    ),
    billingAddress: req("Billing address", 300),
    // Contact
    contactName: req("Full name", 100),
    jobTitle: req("Job title", 120),
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
      .refine(validPhone, "Enter a valid phone number, including country code if outside Nigeria."),
    whatsapp: z
      .string()
      .trim()
      .optional()
      .default("")
      .refine((v) => v === "" || validPhone(v), "Enter a valid WhatsApp number, or leave it blank."),
    // Package
    track: z.enum(TRACK_OPTIONS, { error: "Choose a partnership track." }),
    tier: z.string({ error: "Choose a tier." }).trim().min(1, "Choose a tier."),
    exclusivity: opt("Category", 120),
    objectives: opt("Objectives", 1000),
    // Next steps
    callAvailability: opt("Availability", 200),
    passHolders: opt("VIP pass holders", 2000),
    acknowledge: z.literal("yes", {
      error: "Please confirm you understand how a slot is secured.",
    }),
    accessToken: z.string().max(200).optional().default(""),
    website: z.string().max(0).optional().or(z.literal("")),
  })
  .superRefine((d, ctx) => {
    for (const [path, message] of Object.entries(sponsorCrossFieldErrors(d))) {
      ctx.addIssue({ code: "custom", path: [path], message });
    }
  });

export type SponsorFormInput = z.infer<typeof sponsorFormSchema>;

/** Tier belongs to the track; pass holders are well formed and within the tier's allowance. */
export function sponsorCrossFieldErrors(d: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  const track = typeof d.track === "string" ? d.track : "";
  const tier = typeof d.tier === "string" ? d.tier : "";
  if (track && tier && !tierOptions(track).includes(tier)) out.tier = "Choose a tier for this track.";
  const { holders, error } = parsePassHolders(typeof d.passHolders === "string" ? d.passHolders : "");
  if (error) out.passHolders = error;
  else if (track && tier && holders.length > passLimit(track, tier)) {
    out.passHolders = `${tier} includes up to ${passLimit(track, tier)} VIP passes. You listed ${holders.length}.`;
  }
  return out;
}
