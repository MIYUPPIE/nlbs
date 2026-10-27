import { z } from "zod";
import { startOfDayInZone, zonedTimeToUtc } from "@/lib/countdown";
import { universities, universityBySlug, UNIVERSITY_OTHER } from "@/data/universities";

/**
 * Nigeria 2.0 Talent Fund 2026 application.
 * Source: latest/youth_application_form_questions.pdf.
 *
 * Pure and shared by the client form and /api/talent-application.
 * Deviations from the PDF, each deliberate:
 *  - Q5 drops "from April 2026" (contradicts the application deadline).
 *  - Platinum partner names are not confirmed, so "Platinum Partner" takes a
 *    free-text company name.
 *  - Q3 video is a link: phone videos exceed what the site can accept
 *    without file storage. The PDF allows "video OR link".
 *  - NYSC referrals give their call-up number and state code (convener
 *    request, 27 Oct 2026) so staff can verify corps members.
 */

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT (Abuja)",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export const AGE_BANDS = ["18-24", "25-30", "31-35", "36+"] as const;
export const REFERRALS = [
  "Platinum Partner",
  "University",
  "NYSC",
  "NITDA",
  "BOI",
  "Open Application",
] as const;
export const TRACKS = ["Skills", "Jobs", "Capital"] as const;
export const SKILL_LEVELS = [
  "Beginner - I am learning",
  "Intermediate - I can do projects",
  "Advanced - I have clients / portfolio",
] as const;
export const SKILLS = [
  "AI",
  "Data Analytics",
  "Software Development",
  "Digital Marketing",
  "UI/UX",
  "Cybersecurity",
  "AgriTech",
] as const;
export const CAC_STATUS = ["Yes, registered with CAC", "Registration in progress", "No, idea stage"] as const;
export const MONTHLY_REVENUE = [
  "No revenue yet",
  "Under N100,000",
  "N100,000 - N500,000",
  "N500,000 - N2,000,000",
  "Above N2,000,000",
] as const;
export const DEVICES = ["I have laptop + internet", "I have smartphone only", "I have neither"] as const;
export const YES_NO = ["Yes", "No"] as const;

export const TRACK_DETAILS: Record<(typeof TRACKS)[number], { title: string; body: string; note: string }> = {
  Skills: {
    title: "Skills",
    body: "I want 12-week free training in tech: AI, Data, Cloud or FinTech.",
    note: "For learners",
  },
  Jobs: { title: "Jobs", body: "I want an internship or job placement.", note: "Must have a skill already" },
  Capital: {
    title: "Capital",
    body: "I have a business and need N250K to N2M.",
    note: "Must have CAC or an idea",
  },
};

export const PROBLEM_MAX = 150;
export const PITCH_MAX_WORDS = 30;
export const CV_MAX_BYTES = 2 * 1024 * 1024;
export const NOT_ELIGIBLE = "Thank you, you are not eligible.";

export const countWords = (s: string): number => s.trim().split(/\s+/).filter(Boolean).length;

/**
 * Nigerian mobile (WhatsApp) number → +234XXXXXXXXXX, or null if invalid.
 * Accepts 080 1234 5678, 0801-234-5678, 2348012345678, +234 801 234 5678.
 * Valid prefixes: 070, 080, 081, 090, 091.
 */
export function normalizeNigerianMobile(input: string): string | null {
  const digits = input.replace(/[\s\-().]/g, "");
  const m = /^(?:\+?234|0)([789][01]\d{8})$/.exec(digits);
  return m ? `+234${m[1]}` : null;
}

/**
 * NYSC identifiers, upper-cased with spaces removed, or null if malformed.
 * State code: two-letter state, two-digit year + batch letter (and any stream
 * suffix), serial: LA/24A/1234, FC/23B/0123, OY/25A2/56789.
 * Call-up number: NYSC/<institution>/<year>/<serial>: NYSC/UNILAG/2024/123456.
 */
export const NYSC_STATE_CODE = /^[A-Z]{2}\/\d{2}[A-Z][A-Z0-9]{0,3}\/\d{1,6}$/;
export const NYSC_CALL_UP = /^NYSC\/[A-Z0-9-]{2,20}\/\d{4}\/\d{1,8}$/;

const compactUpper = (input: string) => input.replace(/\s+/g, "").toUpperCase();

export function normalizeNyscStateCode(input: string): string | null {
  const v = compactUpper(input);
  return NYSC_STATE_CODE.test(v) ? v : null;
}

export function normalizeNyscCallUp(input: string): string | null {
  const v = compactUpper(input);
  return NYSC_CALL_UP.test(v) ? v : null;
}

/** Base64 of "%PDF-" starts with "JVBERi0". */
export const looksLikePdf = (base64: string) => base64.startsWith("JVBERi0");

export const base64Bytes = (b64: string) => Math.floor((b64.replace(/=+$/, "").length * 3) / 4);

const req = (label: string, max = 120) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

const urlField = (label: string) =>
  req(label, 500).refine((v) => {
    try {
      const u = new URL(v);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return false;
    }
  }, `Enter a full link, starting with https://`);

const opt = z.string().trim().max(500).optional().default("");

export const cvSchema = z.object({
  name: z.string().max(200),
  type: z.literal("application/pdf", { error: "Your CV must be a PDF." }),
  size: z.number().int().positive().max(CV_MAX_BYTES, "Your CV must be 2 MB or smaller."),
  data: z
    .string()
    .refine(looksLikePdf, "Your CV must be a PDF.")
    .refine((d) => base64Bytes(d) <= CV_MAX_BYTES, "Your CV must be 2 MB or smaller."),
});

export type CvUpload = z.infer<typeof cvSchema>;

export const talentApplicationSchema = z
  .object({
    // Section 1: who are you
    fullName: req("Full name", 100).refine((v) => v.length >= 2, "Full name is required."),
    whatsapp: req("WhatsApp number", 20).refine(
      (v) => normalizeNigerianMobile(v) !== null,
      "Enter a Nigerian mobile number starting with 070, 080, 081, 090 or 091.",
    ),
    email: req("Email", 254).pipe(z.email("Enter a valid email address.")),
    state: z.enum(NIGERIAN_STATES, { error: "Select your state of residence." }),
    ageBand: z.enum(AGE_BANDS, { error: "Select your age." }),
    referral: z.enum(REFERRALS, { error: "Tell us who referred you." }),
    referralPartner: opt,
    // Referred by a university: its slug (src/data/universities.ts) or "other" plus its name.
    university: opt,
    universityOther: opt,
    // Referred by NYSC: the corps member's call-up number and state code.
    nyscCallUpNumber: opt,
    nyscStateCode: opt,
    // Section 2: track
    track: z.enum(TRACKS, { error: "Choose one track." }),
    // Section 3: filter questions
    skillLevel: z.enum(SKILL_LEVELS, { error: "Select your current skill level." }),
    problem: req("Your problem statement", PROBLEM_MAX).refine(
      (v) => v.length >= 10,
      "Please be specific: at least 10 characters.",
    ),
    videoUrl: urlField("Your video link"),
    skill: opt,
    cv: cvSchema.optional().nullable(),
    portfolioUrl: opt,
    businessName: opt,
    cacStatus: opt,
    monthlyRevenue: opt,
    available: z.enum(YES_NO, { error: "Tell us if you can commit the time." }),
    priorSupport: z.enum(YES_NO, { error: "Tell us if you have received a grant or training before." }),
    priorSupportFrom: opt,
    devices: z.enum(DEVICES, { error: "Tell us what you have access to." }),
    pitch: req("Your pitch", 300)
      .refine((v) => countWords(v) <= PITCH_MAX_WORDS, `Keep it to ${PITCH_MAX_WORDS} words or fewer.`)
      .refine((v) => countWords(v) >= 5, "Give us at least a few words."),
    consent: z.literal(true, { error: "Please agree to how your data is used." }),
    website: z.string().max(0).optional().or(z.literal("")),
  })
  .superRefine((d, ctx) => {
    for (const [path, message] of Object.entries(conditionalErrors(d))) {
      ctx.addIssue({ code: "custom", path: [path], message });
    }
  });

const isHttpUrl = (v: unknown) => {
  if (typeof v !== "string" || !v) return false;
  try {
    return /^https?:$/.test(new URL(v).protocol);
  } catch {
    return false;
  }
};

/**
 * Cross-field rules (partner name, prior support, per-track questions).
 * Exported so the multi-step form can show them alongside field errors;
 * Zod only runs the object refinement once every base field is valid.
 */
export function conditionalErrors(d: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  const has = (k: string) => typeof d[k] === "string" && (d[k] as string).trim() !== "";
  if (d.referral === "Platinum Partner" && !has("referralPartner"))
    out.referralPartner = "Which partner referred you?";
  if (d.referral === "University") {
    const u = typeof d.university === "string" ? d.university : "";
    if (!universityBySlug(u) && u !== UNIVERSITY_OTHER) out.university = "Select your university.";
    else if (u === UNIVERSITY_OTHER && !has("universityOther")) out.universityOther = "Which university?";
    else if (typeof d.universityOther === "string" && d.universityOther.length > 120)
      out.universityOther = "Keep the name to 120 characters or fewer.";
  }
  if (d.referral === "NYSC") {
    if (!has("nyscCallUpNumber")) out.nyscCallUpNumber = "Enter your NYSC call-up number.";
    else if (normalizeNyscCallUp(d.nyscCallUpNumber as string) === null)
      out.nyscCallUpNumber = "Enter it as printed on your call-up letter, e.g. NYSC/UNILAG/2024/123456.";
    if (!has("nyscStateCode")) out.nyscStateCode = "Enter your NYSC state code.";
    else if (normalizeNyscStateCode(d.nyscStateCode as string) === null)
      out.nyscStateCode = "Enter it as shown on your NYSC ID card, e.g. LA/24A/1234.";
  }
  if (d.priorSupport === "Yes" && !has("priorSupportFrom"))
    out.priorSupportFrom = "Who provided the grant or training?";
  if (d.track === "Skills" && !(SKILLS as readonly unknown[]).includes(d.skill))
    out.skill = "Select the skill you want.";
  if (d.track === "Jobs") {
    if (!d.cv) out.cv = "Upload your CV as a PDF.";
    if (!isHttpUrl(d.portfolioUrl))
      out.portfolioUrl = "Add your LinkedIn or portfolio link, starting with https://";
  }
  if (d.track === "Capital") {
    if (!has("businessName")) out.businessName = "What is your business name?";
    if (!(CAC_STATUS as readonly unknown[]).includes(d.cacStatus)) out.cacStatus = "Tell us your CAC status.";
    if (!(MONTHLY_REVENUE as readonly unknown[]).includes(d.monthlyRevenue))
      out.monthlyRevenue = "Select your monthly revenue.";
  }
  return out;
}

export type TalentApplication = z.infer<typeof talentApplicationSchema>;

/** Auto-reject rules from the PDF: age 36+ and "No" to availability. */
export function eligibility(
  d: Pick<TalentApplication, "ageBand" | "available"> | Partial<TalentApplication>,
): {
  eligible: boolean;
  reason: "age" | "availability" | null;
} {
  if (d.ageBand === "36+") return { eligible: false, reason: "age" };
  if (d.available === "No") return { eligible: false, reason: "availability" };
  return { eligible: true, reason: null };
}

/** Fields that belong to a track or referral other than the chosen one are cleared; NYSC codes are normalised. */
export function stripOtherTracks(d: TalentApplication): TalentApplication {
  const nysc = d.referral === "NYSC";
  return {
    ...d,
    skill: d.track === "Skills" ? d.skill : "",
    cv: d.track === "Jobs" ? d.cv : null,
    portfolioUrl: d.track === "Jobs" ? d.portfolioUrl : "",
    businessName: d.track === "Capital" ? d.businessName : "",
    cacStatus: d.track === "Capital" ? d.cacStatus : "",
    monthlyRevenue: d.track === "Capital" ? d.monthlyRevenue : "",
    referralPartner: d.referral === "Platinum Partner" ? d.referralPartner : "",
    university: d.referral === "University" ? d.university : "",
    universityOther:
      d.referral === "University" && d.university === UNIVERSITY_OTHER ? d.universityOther : "",
    nyscCallUpNumber: nysc ? (normalizeNyscCallUp(d.nyscCallUpNumber) ?? d.nyscCallUpNumber) : "",
    nyscStateCode: nysc ? (normalizeNyscStateCode(d.nyscStateCode) ?? d.nyscStateCode) : "",
    priorSupportFrom: d.priorSupport === "Yes" ? d.priorSupportFrom : "",
  };
}

// ---------------------------------------------------------------------------
// Screening (internal; never shown to applicants)
// ---------------------------------------------------------------------------

export type Band = "Shortlist for interview" | "Waitlist" | "Reject";

/** PDF cut-offs: 70+ shortlist, 50-69 waitlist, under 50 reject. */
export const band = (points: number): Band =>
  points >= 70 ? "Shortlist for interview" : points >= 50 ? "Waitlist" : "Reject";

const GENERIC_PROBLEM = /^\W*(i\s+(want|need)\s+to\s+)?(make|get|earn)\s+(some\s+)?money\W*$/i;

export type Screening = {
  autoPoints: number;
  breakdown: { video: number; partnerReferral: number; ageAndAvailability: number };
  /** Scored by reviewers (PDF: "Problem statement specific", "Q8 pitch clear"). */
  pendingReview: { problemStatement: { max: 20 }; pitch: { max: 20 } };
  maxPoints: 100;
  /** Best and worst possible band once reviewers score the pending items. */
  bandRange: { ifReviewScoresZero: Band; ifReviewScoresFull: Band };
  suggestedTrack: (typeof TRACKS)[number];
  flags: string[];
};

export function screen(d: TalentApplication): Screening {
  const video = d.videoUrl ? 30 : 0;
  const partnerReferral = d.referral === "Platinum Partner" ? 15 : 0;
  const ageAndAvailability =
    (d.ageBand === "18-24" || d.ageBand === "25-30") && d.available === "Yes" ? 15 : 0;
  const autoPoints = video + partnerReferral + ageAndAvailability;

  // PDF: Beginner → place in Skills, Advanced → place in Jobs. Capital is a
  // business track, so skill level does not re-route it.
  const suggestedTrack =
    d.track === "Jobs" && d.skillLevel.startsWith("Beginner")
      ? "Skills"
      : d.track === "Skills" && d.skillLevel.startsWith("Advanced")
        ? "Jobs"
        : d.track;

  const flags: string[] = [];
  if (GENERIC_PROBLEM.test(d.problem.trim())) flags.push("generic_problem_statement");
  if (suggestedTrack !== d.track) flags.push("skill_level_track_mismatch");
  if (d.priorSupport === "Yes") flags.push("received_prior_support");
  if (d.referral === "Platinum Partner") flags.push("partner_referral_unverified");
  if (d.devices === "I have neither") flags.push("needs_hub_access");

  return {
    autoPoints,
    breakdown: { video, partnerReferral, ageAndAvailability },
    pendingReview: { problemStatement: { max: 20 }, pitch: { max: 20 } },
    maxPoints: 100,
    bandRange: { ifReviewScoresZero: band(autoPoints), ifReviewScoresFull: band(autoPoints + 40) },
    suggestedTrack,
    flags,
  };
}

// ---------------------------------------------------------------------------
// Application window
// ---------------------------------------------------------------------------

export const WINDOW = {
  opensIso: "2026-10-01",
  // Extended from 30 Oct at stakeholders' request (convener, 27 Oct 2026).
  closesIso: "2026-11-10",
  timeZone: "Africa/Lagos",
} as const;

export type WindowStatus = "upcoming" | "open" | "closed";

/**
 * Open from 00:00 on 1 Oct to 23:59:59 on 10 Nov 2026, Lagos time.
 * `override` ("open" | "closed") comes from TALENT_APPLICATIONS_OVERRIDE for
 * early opening, extensions or testing.
 */
export function applicationWindow(nowMs: number, override?: string): WindowStatus {
  if (override === "open" || override === "closed") return override;
  const opens = zonedTimeToUtc(WINDOW.opensIso, "00:00", WINDOW.timeZone);
  const closes = startOfDayInZone(WINDOW.closesIso, WINDOW.timeZone) + 86_400_000;
  if (nowMs < opens) return "upcoming";
  if (nowMs >= closes) return "closed";
  return "open";
}

/** University choices for the form: the invited list, then "Other". */
export const UNIVERSITY_OPTIONS = [
  ...universities.map((u) => ({ value: u.slug, label: u.name })),
  { value: UNIVERSITY_OTHER, label: "Another university" },
] as const;

/** `?university=unilag` on /talentnigeria20 (the link a university shares): a known slug, or null. */
export const universityFromQuery = (raw: string): string | null => {
  const slug = raw.trim().toLowerCase();
  return universityBySlug(slug) ? slug : null;
};
