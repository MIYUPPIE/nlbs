import { enquirySchema } from "@/lib/enquiry";
import type { SubmissionResponse } from "@/lib/forms";
import { registrationSchema } from "@/lib/registration";
import { parsePassHolders, passLimit, sponsorFormSchema } from "@/lib/sponsor-form";
import {
  eligibility,
  NOT_ELIGIBLE,
  normalizeNigerianMobile,
  screen,
  stripOtherTracks,
  talentApplicationSchema,
} from "@/lib/talent-form";
import { submitToCentral, type CentralForm } from "@/lib/central";
import { privacyRequestPayload, privacyRequestSchema } from "@/lib/privacy";
import { universityFormSchema, universityPayload } from "@/lib/university-form";

/**
 * What each form sends to the central backend. These are the steps the old
 * /api routes did on the server (validate, clean up, derive), now done in the
 * browser. Pure, so the exact payloads are unit-tested against the backend's
 * contract fixtures.
 *
 * The `website` honeypot is sent as-is: the backend answers a filled one with
 * a fake success and stores nothing.
 */

export type Prepared = { ok: true; fields: Record<string, unknown> } | { ok: false; error: string };

const invalid = (): Prepared => ({ ok: false, error: "Please correct the highlighted fields." });

export const prepare: Record<CentralForm, (values: unknown) => Prepared> = {
  registration(values) {
    const r = registrationSchema.safeParse(values);
    if (!r.success) return invalid();
    // Explicit consent travels as a boolean, and only counts when there are needs to consent to.
    const { accessNeedsConsent, ...fields } = r.data;
    return {
      ok: true,
      fields: { ...fields, accessNeedsConsent: fields.accessNeeds !== "" && accessNeedsConsent === "yes" },
    };
  },

  enquiry(values) {
    const r = enquirySchema.safeParse(values);
    return r.success ? { ok: true, fields: r.data } : invalid();
  },

  sponsor(values) {
    const r = sponsorFormSchema.safeParse(values);
    if (!r.success) return invalid();
    const { acknowledge: _ack, passHolders, ...fields } = r.data;
    void _ack;
    return {
      ok: true,
      fields: {
        ...fields,
        passHolders: parsePassHolders(passHolders).holders,
        passAllowance: passLimit(fields.track, fields.tier),
      },
    };
  },

  privacy(values) {
    const r = privacyRequestSchema.safeParse(values);
    return r.success ? { ok: true, fields: privacyRequestPayload(r.data) } : invalid();
  },

  university(values) {
    const r = universityFormSchema.safeParse(values);
    return r.success ? { ok: true, fields: universityPayload(r.data) } : invalid();
  },

  talent(values) {
    const r = talentApplicationSchema.safeParse(values);
    if (!r.success) return invalid();
    if (!eligibility(r.data).eligible) return { ok: false, error: NOT_ELIGIBLE };
    const clean = stripOtherTracks(r.data);
    return {
      ok: true,
      fields: { ...clean, whatsapp: normalizeNigerianMobile(clean.whatsapp), screening: screen(clean) },
    };
  },
};

/** Validate, prepare and send one form to the central backend. */
export async function sendForm(form: CentralForm, values: unknown): Promise<SubmissionResponse> {
  const p = prepare[form](values);
  return p.ok ? submitToCentral(form, p.fields) : p;
}
