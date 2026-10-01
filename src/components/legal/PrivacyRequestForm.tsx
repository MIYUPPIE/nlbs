"use client";

import { useEffect, useRef } from "react";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { LEGAL, NEEDS_DETAILS, REQUEST_TYPES, privacyRequestSchema, type RequestType } from "@/lib/privacy";
import { buttonClasses } from "@/components/ui/GoldButton";
import { Honeypot, SelectField, TextAreaField, TextField } from "@/components/forms/Field";
import { useSubmissionForm } from "@/components/forms/useSubmissionForm";
import { sendForm } from "@/lib/outgoing";
import { useHydrated } from "@/components/hooks/useHydrated";

/** NDPA data subject request, posted to the central backend as form "privacy". */
export function PrivacyRequestForm() {
  const { formRef, ...form } = useSubmissionForm(
    privacyRequestSchema,
    {
      fullName: "",
      email: "",
      phone: "",
      requestType: "",
      reference: "",
      details: "",
      confirm: "",
      website: "",
    },
    (v) => sendForm("privacy", v),
  );
  const successRef = useRef<HTMLHeadingElement>(null);
  const hydrated = useHydrated();
  const { dpoEmail, responseDays, requestKeptFor } = LEGAL.facts;

  useEffect(() => {
    if (form.status === "success") successRef.current?.focus();
  }, [form.status]);

  if (form.status === "success") {
    return (
      <div role="status" className="rounded-3xl border border-gold/50 bg-white p-8 sm:p-10">
        <CircleCheck aria-hidden="true" className="size-10 text-gold-ink" />
        <h2 ref={successRef} tabIndex={-1} className="mt-5 font-display text-3xl text-navy-950 outline-none">
          Request received
        </h2>
        <p className="mt-3 text-muted">
          We will reply to <strong className="text-navy-950">{form.values.email}</strong> within{" "}
          {responseDays} days. We may first ask you to confirm it is you, so we never give your data to
          someone else.
        </p>
        <p className="mt-4 text-sm text-muted">
          Reference <span className="font-mono font-semibold text-navy-950">{form.reference}</span>
        </p>
      </div>
    );
  }

  const field = { onChange: form.setField, onBlur: form.blurField };
  const submitting = form.status === "submitting";
  const needsDetails = NEEDS_DETAILS.includes(form.values.requestType as RequestType);

  return (
    <form
      ref={formRef}
      method="post"
      noValidate
      onSubmit={form.onSubmit}
      className="relative rounded-3xl border border-line bg-white p-6 sm:p-10"
    >
      <h2 className="font-display text-3xl text-navy-950">Make a privacy request</h2>
      <p className="mt-2 text-sm text-muted">
        Use the email you gave us, so we can find your data. Free of charge; we answer within {responseDays}{" "}
        days.
      </p>
      {form.formError && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>
            {form.formError} You can also email{" "}
            <a href={`mailto:${dpoEmail}`} className="underline">
              {dpoEmail}
            </a>
            .
          </p>
        </div>
      )}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <TextField
          name="fullName"
          label="Full name"
          autoComplete="name"
          required
          value={form.values.fullName}
          error={form.errors.fullName}
          {...field}
        />
        <TextField
          name="email"
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={form.values.email}
          error={form.errors.email}
          {...field}
        />
        <TextField
          name="phone"
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          value={form.values.phone}
          error={form.errors.phone}
          hint="Helps us find WhatsApp-only records."
          {...field}
        />
        <TextField
          name="reference"
          label="Reference (optional)"
          value={form.values.reference}
          error={form.errors.reference}
          hint="From an earlier form or order, e.g. N2-7K4Q-9XPA."
          {...field}
        />
        <SelectField
          name="requestType"
          label="What would you like us to do?"
          required
          options={REQUEST_TYPES}
          placeholder="Choose a request"
          value={form.values.requestType}
          error={form.errors.requestType}
          className="sm:col-span-2"
          {...field}
        />
        <TextAreaField
          name="details"
          label={needsDetails ? "Details" : "Details (optional)"}
          required={needsDetails}
          value={form.values.details}
          error={form.errors.details}
          hint="What should we correct, which use do you object to, or which decision should a person review?"
          className="sm:col-span-2"
          {...field}
        />
      </div>
      <div className="mt-8">
        <div className="flex items-start gap-3">
          <input
            id="f-confirm"
            name="confirm"
            type="checkbox"
            checked={form.values.confirm === "yes"}
            aria-invalid={form.errors.confirm ? true : undefined}
            aria-describedby={form.errors.confirm ? "f-confirm-error" : undefined}
            onChange={(e) => form.setField("confirm", e.target.checked ? "yes" : "")}
            onBlur={() => form.blurField("confirm")}
            className="mt-1 size-5 shrink-0 accent-navy-950"
          />
          <label htmlFor="f-confirm" className="text-sm leading-relaxed text-ink">
            The data is about me, or I am authorised to act for the person it is about.
            <span className="text-gold-ink" aria-hidden="true">
              {" "}
              *
            </span>
          </label>
        </div>
        {form.errors.confirm && (
          <p id="f-confirm-error" className="mt-1.5 pl-8 text-sm font-medium text-red-700">
            {form.errors.confirm}
          </p>
        )}
      </div>
      <Honeypot value={form.values.website} onChange={(v) => form.setField("website", v)} />
      <button
        type="submit"
        disabled={submitting || !hydrated}
        className={buttonClasses(
          "gold",
          "lg",
          "mt-8 w-full disabled:cursor-wait disabled:opacity-80 sm:w-auto",
        )}
      >
        {submitting ? (
          <>
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Send request"
        )}
      </button>
      <p className="mt-4 text-xs text-muted">
        We use these details only to answer your request, and keep them for {requestKeptFor} as proof that we
        did.
      </p>
    </form>
  );
}
