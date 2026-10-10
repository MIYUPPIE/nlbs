"use client";

import { useEffect, useRef, useState } from "react";
import { CircleAlert, CircleCheck, FileText, LoaderCircle, Upload, X } from "lucide-react";
import type { University } from "@/data/universities";
import { LETTERHEAD_MAX_BYTES, universityFormSchema, type LetterheadUpload } from "@/lib/university-form";
import { sendForm } from "@/lib/outgoing";
import { Honeypot, TextAreaField, TextField } from "@/components/forms/Field";
import { useHydrated } from "@/components/hooks/useHydrated";
import { PrivacyNotice } from "@/components/legal/PrivacyNotice";
import { buttonClasses } from "@/components/ui/GoldButton";

const EMPTY = {
  focalName: "",
  focalTitle: "",
  email: "",
  phone: "",
  expectedNominees: "",
  message: "",
  website: "",
};

/**
 * Career Services confirms the university is taking part (form "university",
 * src/lib/university-form.ts). Staff check the letter and then the page shows
 * the university as confirmed. Students are never listed here.
 */
export function UniversityConfirmForm({ university }: { university: University }) {
  const [values, setValues] = useState(EMPTY);
  const [letterhead, setLetterhead] = useState<LetterheadUpload | null>(null);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const hydrated = useHydrated();

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const all = (v = values, file = letterhead, ok = consent) => ({
    ...v,
    university: university.slug,
    letterhead: file,
    consent: ok,
  });

  const errorsFor = (input: ReturnType<typeof all>) => {
    const out: Record<string, string> = {};
    const r = universityFormSchema.safeParse(input);
    if (!r.success)
      for (const i of r.error.issues) {
        const k = i.path[0];
        if (typeof k === "string" && !out[k]) out[k] = i.message;
      }
    return out;
  };

  const set = (name: string, value: string) => {
    const next = { ...values, [name]: value };
    setValues(next);
    if (errors[name]) setErrors((e) => ({ ...e, [name]: errorsFor(all(next))[name] ?? "" }));
  };
  const blur = (name: string) => setErrors((e) => ({ ...e, [name]: errorsFor(all())[name] ?? "" }));
  const field = { onChange: set, onBlur: blur };

  const pickFile = (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf")
      return setErrors((e) => ({ ...e, letterhead: "The letter must be a PDF." }));
    if (file.size > LETTERHEAD_MAX_BYTES)
      return setErrors((e) => ({ ...e, letterhead: "The letter must be 2 MB or smaller." }));
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result).split(",")[1] ?? "";
      setLetterhead({ name: file.name, type: "application/pdf", size: file.size, data });
      setErrors((e) => ({ ...e, letterhead: "" }));
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;
    setFormError(null);
    const input = all();
    const errs = errorsFor(input);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setStatus("error");
      setFormError("Please correct the highlighted fields.");
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"], #f-${first}`)?.focus();
      return;
    }
    setStatus("submitting");
    const res = await sendForm("university", input);
    if (res.ok) {
      setReference(res.reference);
      setStatus("success");
      return;
    }
    setStatus("error");
    setFormError(res.error);
    if (res.fieldErrors) setErrors(res.fieldErrors);
  };

  if (status === "success") {
    return (
      <div role="status" className="rounded-3xl border border-gold/50 bg-white p-8 sm:p-10">
        <CircleCheck aria-hidden="true" className="size-10 text-gold-ink" />
        <h2 ref={successRef} tabIndex={-1} className="mt-5 font-display text-3xl text-navy-950 outline-none">
          Confirmation received
        </h2>
        <p className="mt-3 text-muted">
          Thank you. We will check your letter and contact{" "}
          <strong className="text-navy-950">{values.email}</strong>. Your page shows {university.short} as
          confirmed once that is done. In the meantime, share the student link above.
        </p>
        <p className="mt-4 text-sm text-muted">
          Reference <span className="font-mono font-semibold text-navy-950">{reference}</span>
        </p>
      </div>
    );
  }

  const submitting = status === "submitting";
  return (
    <form
      ref={formRef}
      method="post"
      noValidate
      onSubmit={onSubmit}
      aria-labelledby="confirm-title"
      className="relative rounded-3xl border border-line bg-white p-6 sm:p-10"
    >
      <h2 id="confirm-title" className="font-display text-3xl text-navy-950">
        Confirm {university.short}&apos;s participation
      </h2>
      <p className="mt-2 text-sm text-muted">
        For the Career Services focal person. This shares your contact details only, never students&apos;.
      </p>
      {formError && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>{formError}</p>
        </div>
      )}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <TextField
          name="focalName"
          label="Your full name"
          autoComplete="name"
          required
          value={values.focalName}
          error={errors.focalName}
          {...field}
        />
        <TextField
          name="focalTitle"
          label="Job title"
          autoComplete="organization-title"
          required
          hint="For example: Director, Career Services"
          value={values.focalTitle}
          error={errors.focalTitle}
          {...field}
        />
        <TextField
          name="email"
          label="Work email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          error={errors.email}
          {...field}
        />
        <TextField
          name="phone"
          label="Phone or WhatsApp"
          type="tel"
          autoComplete="tel"
          required
          value={values.phone}
          error={errors.phone}
          {...field}
        />
        <TextField
          name="expectedNominees"
          label="Students you expect to encourage to apply"
          inputMode="numeric"
          hint="An estimate is fine. Leave blank if unsure."
          value={values.expectedNominees}
          error={errors.expectedNominees}
          {...field}
        />
        <div>
          <p className="mb-2 block text-sm font-semibold text-navy-950">
            Confirmation letter{" "}
            <span className="font-normal text-muted">(PDF on letterhead, optional now)</span>
          </p>
          <input
            ref={fileRef}
            id="f-letterhead"
            name="letterhead"
            type="file"
            accept="application/pdf"
            className="sr-only"
            aria-describedby={errors.letterhead ? "f-letterhead-error" : "f-letterhead-hint"}
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          {letterhead ? (
            <div className="flex h-12 items-center gap-3 rounded-xl border border-line px-4">
              <FileText aria-hidden="true" className="size-4 shrink-0 text-navy-700" />
              <span className="min-w-0 flex-1 truncate text-sm text-navy-950">{letterhead.name}</span>
              <button
                type="button"
                onClick={() => {
                  setLetterhead(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                aria-label="Remove the letter"
                className="text-muted hover:text-navy-950"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="f-letterhead"
              className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line text-sm font-medium text-navy-950 hover:border-navy-700"
            >
              <Upload aria-hidden="true" className="size-4" />
              Choose PDF (max 2 MB)
            </label>
          )}
          {errors.letterhead ? (
            <p id="f-letterhead-error" className="mt-1.5 text-xs text-red-700">
              {errors.letterhead}
            </p>
          ) : (
            <p id="f-letterhead-hint" className="mt-1.5 text-xs text-muted">
              You can also email it later. We show you as confirmed once we have checked it.
            </p>
          )}
        </div>
        <TextAreaField
          name="message"
          label="Anything we should know"
          rows={3}
          value={values.message}
          error={errors.message}
          className="sm:col-span-2"
          {...field}
        />
      </div>
      <label className="mt-6 flex items-start gap-3 text-sm text-navy-950">
        <input
          type="checkbox"
          name="consent"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            if (errors.consent) setErrors((x) => ({ ...x, consent: e.target.checked ? "" : x.consent }));
          }}
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? "f-consent-error" : undefined}
          className="mt-1 size-4 accent-navy-950"
        />
        <span>
          I am authorised to confirm {university.name}&apos;s participation, and you may contact me about the
          Talent Fund.
        </span>
      </label>
      {errors.consent && (
        <p id="f-consent-error" className="mt-1.5 text-xs text-red-700">
          {errors.consent}
        </p>
      )}
      <Honeypot value={values.website} onChange={(v) => set("website", v)} />
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PrivacyNotice purpose="We use these details to record your university's confirmation and to contact you about the Talent Fund." />
        <button
          type="submit"
          disabled={submitting || !hydrated}
          className={buttonClasses("gold", "lg", "w-full disabled:cursor-wait disabled:opacity-80 sm:w-auto")}
        >
          {submitting ? (
            <>
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              Sending
            </>
          ) : (
            "Confirm participation"
          )}
        </button>
      </div>
    </form>
  );
}
