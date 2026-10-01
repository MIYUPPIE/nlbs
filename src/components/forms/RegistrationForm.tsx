"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { event } from "@/data/event";
import { delegateTypes, registrationSchema, sectors } from "@/lib/registration";
import { buttonClasses } from "@/components/ui/GoldButton";
import { Honeypot, SelectField, TextField } from "@/components/forms/Field";
import { useSubmissionForm } from "@/components/forms/useSubmissionForm";
import { sendForm } from "@/lib/outgoing";
import { useQueryPrefill } from "@/components/hooks/useQueryPrefill";
import { useHydrated } from "@/components/hooks/useHydrated";
import { PrivacyNotice } from "@/components/legal/PrivacyNotice";

const emptyValues = {
  fullName: "",
  email: "",
  phone: "",
  organisation: "",
  jobTitle: "",
  sector: "",
  country: "Nigeria",
  delegateType: "",
  whatsapp: "",
  nominatedBy: "",
  accessNeeds: "",
  accessNeedsConsent: "",
  website: "",
};

const pickDelegateType = (raw: string) => ((delegateTypes as readonly string[]).includes(raw) ? raw : null);

export function RegistrationForm() {
  const { formRef, ...form } = useSubmissionForm(registrationSchema, emptyValues, (v) =>
    sendForm("registration", v),
  );
  // /register?type=Investor preselects the delegate type.
  useQueryPrefill("type", pickDelegateType, (v) => form.setField("delegateType", v));
  const successRef = useRef<HTMLHeadingElement>(null);
  // Submit stays disabled until hydrated so a pre-hydration submit cannot fire natively.
  const hydrated = useHydrated();

  useEffect(() => {
    if (form.status === "success") successRef.current?.focus();
  }, [form.status]);

  if (form.status === "success") {
    return (
      <div role="status" className="rounded-3xl border border-gold/50 bg-white p-8 text-center sm:p-12">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-navy-950 text-gold">
          <CircleCheck aria-hidden="true" className="size-8" />
        </span>
        <h2 ref={successRef} tabIndex={-1} className="mt-6 font-display text-4xl text-navy-950 outline-none">
          Request received
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Thank you, {form.values.fullName.split(" ")[0]}. Your invitation request for {event.shortName} has
          been received. Once it is vetted, the summit team will confirm your seat at{" "}
          <strong className="text-navy-950">{form.values.email}</strong>, where your QR entry code will also
          be sent.
        </p>
        <dl className="mx-auto mt-8 grid max-w-sm gap-3 rounded-2xl bg-ivory p-5 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Reference</dt>
            <dd className="font-mono font-semibold text-navy-950">{form.reference}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Date</dt>
            <dd className="text-right text-navy-950">{event.date.display}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Venue</dt>
            <dd className="text-right text-navy-950">{event.venue.display}</dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/programme" className={buttonClasses("gold")}>
            Explore the programme
          </Link>
          <button type="button" onClick={form.reset} className={buttonClasses("outline-dark")}>
            Request for another delegate
          </button>
        </div>
      </div>
    );
  }

  const field = {
    onChange: form.setField,
    onBlur: form.blurField,
  };
  const submitting = form.status === "submitting";

  return (
    <form
      ref={formRef}
      method="post"
      noValidate
      onSubmit={form.onSubmit}
      aria-describedby="registration-note"
      className="relative rounded-3xl border border-line bg-white p-6 sm:p-10"
    >
      {form.formError && (
        <div
          role="alert"
          className="mb-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>{form.formError}</p>
        </div>
      )}

      <fieldset>
        <legend className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">
          Your details
        </legend>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <TextField
            name="fullName"
            label="Full Name"
            autoComplete="name"
            required
            value={form.values.fullName}
            error={form.errors.fullName}
            className="sm:col-span-2"
            {...field}
          />
          <TextField
            name="email"
            label="Email Address"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={form.values.email}
            error={form.errors.email}
            {...field}
          />
          <TextField
            name="phone"
            label="Phone Number"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            hint="Include your country code if outside Nigeria, e.g. +44."
            value={form.values.phone}
            error={form.errors.phone}
            {...field}
          />
          <TextField
            name="whatsapp"
            label="WhatsApp Number"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            hint="Leave blank if it is your phone number."
            value={form.values.whatsapp}
            error={form.errors.whatsapp}
            className="sm:col-span-2"
            {...field}
          />
        </div>
      </fieldset>

      <fieldset className="mt-10 border-t border-line pt-8">
        <legend className="sr-only">Your organisation</legend>
        <p aria-hidden="true" className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">
          Your organisation
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <TextField
            name="organisation"
            label="Organisation"
            autoComplete="organization"
            required
            value={form.values.organisation}
            error={form.errors.organisation}
            {...field}
          />
          <TextField
            name="jobTitle"
            label="Job Title"
            autoComplete="organization-title"
            required
            value={form.values.jobTitle}
            error={form.errors.jobTitle}
            {...field}
          />
          <SelectField
            name="sector"
            label="Sector"
            required
            options={sectors}
            placeholder="Select your sector"
            value={form.values.sector}
            error={form.errors.sector}
            {...field}
          />
          <TextField
            name="country"
            label="Country"
            autoComplete="country-name"
            required
            value={form.values.country}
            error={form.errors.country}
            {...field}
          />
          <SelectField
            name="delegateType"
            label="Delegate Type"
            required
            options={delegateTypes}
            placeholder="Select a delegate type"
            value={form.values.delegateType}
            error={form.errors.delegateType}
            className="sm:col-span-2"
            {...field}
          />
        </div>
      </fieldset>

      <fieldset className="mt-10 border-t border-line pt-8">
        <legend className="sr-only">Invitation details</legend>
        <p aria-hidden="true" className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">
          Invitation details
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <TextField
            name="nominatedBy"
            label="Who nominated you?"
            hint="A partner, chamber of commerce, bank or organisation. Leave blank if none."
            value={form.values.nominatedBy}
            error={form.errors.nominatedBy}
            {...field}
          />
          <TextField
            name="accessNeeds"
            label="Dietary or access needs"
            value={form.values.accessNeeds}
            error={form.errors.accessNeeds}
            hint="Optional. Used only to arrange catering and access for you."
            {...field}
          />
        </div>
        {form.values.accessNeeds.trim() !== "" && (
          <div className="mt-6">
            <div className="flex items-start gap-3">
              <input
                id="f-accessNeedsConsent"
                name="accessNeedsConsent"
                type="checkbox"
                checked={form.values.accessNeedsConsent === "yes"}
                aria-invalid={form.errors.accessNeedsConsent ? true : undefined}
                aria-describedby={form.errors.accessNeedsConsent ? "f-accessNeedsConsent-error" : undefined}
                onChange={(e) => form.setField("accessNeedsConsent", e.target.checked ? "yes" : "")}
                onBlur={() => form.blurField("accessNeedsConsent")}
                className="mt-1 size-5 shrink-0 accent-navy-950"
              />
              <label htmlFor="f-accessNeedsConsent" className="text-sm leading-relaxed text-ink">
                I consent to the summit team using my dietary or access needs (which may reveal health or
                religious information) only to arrange catering and access for me. I can withdraw this at any
                time.
                <span className="text-gold-ink" aria-hidden="true">
                  {" "}
                  *
                </span>
              </label>
            </div>
            {form.errors.accessNeedsConsent && (
              <p id="f-accessNeedsConsent-error" className="mt-1.5 pl-8 text-sm font-medium text-red-700">
                {form.errors.accessNeedsConsent}
              </p>
            )}
          </div>
        )}
      </fieldset>

      <Honeypot value={form.values.website} onChange={(v) => form.setField("website", v)} />

      <div className="mt-10 flex flex-col gap-5 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <PrivacyNotice
          id="registration-note"
          purpose="Fields marked * are required. Your details are used only to manage your participation in the summit."
        />
        <button
          type="submit"
          disabled={submitting || !hydrated}
          className={buttonClasses("gold", "lg", "w-full disabled:cursor-wait disabled:opacity-80 sm:w-auto")}
        >
          {submitting ? (
            <>
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              Submitting…
            </>
          ) : (
            "Request Invitation"
          )}
        </button>
      </div>
      <p aria-live="polite" className="sr-only">
        {submitting ? "Submitting your request" : ""}
      </p>
    </form>
  );
}
