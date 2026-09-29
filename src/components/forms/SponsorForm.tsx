"use client";

import { useEffect, useRef } from "react";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { partnershipSteps } from "@/data/partnership";
import { sectors } from "@/lib/registration";
import { passLimit, sponsorFormSchema, tierOptions, TRACK_OPTIONS } from "@/lib/sponsor-form";
import { buttonClasses } from "@/components/ui/GoldButton";
import { Honeypot, SelectField, TextAreaField, TextField } from "@/components/forms/Field";
import { useSubmissionForm } from "@/components/forms/useSubmissionForm";
import { useHydrated } from "@/components/hooks/useHydrated";

export function SponsorForm({ accessToken }: { accessToken: string }) {
  const { formRef, ...form } = useSubmissionForm(
    sponsorFormSchema,
    {
      companyName: "",
      industry: "",
      companyWebsite: "",
      billingAddress: "",
      contactName: "",
      jobTitle: "",
      email: "",
      phone: "",
      whatsapp: "",
      track: "Official Sponsor",
      tier: "",
      exclusivity: "",
      objectives: "",
      callAvailability: "",
      passHolders: "",
      acknowledge: "",
      accessToken,
      website: "",
    },
    "/api/sponsor",
  );
  const successRef = useRef<HTMLHeadingElement>(null);
  const hydrated = useHydrated();

  useEffect(() => {
    if (form.status === "success") successRef.current?.focus();
  }, [form.status]);

  const v = form.values;

  if (form.status === "success") {
    return (
      <div role="status" className="rounded-3xl border border-gold/50 bg-white p-8 sm:p-12">
        <CircleCheck aria-hidden="true" className="size-10 text-gold-ink" />
        <h2 ref={successRef} tabIndex={-1} className="mt-5 font-display text-4xl text-navy-950 outline-none">
          Package request received
        </h2>
        <p className="mt-4 max-w-xl text-muted">
          Thank you, {v.contactName.split(" ")[0]}. The convener&apos;s office will contact you at{" "}
          <strong className="text-navy-950">{v.email}</strong> to book your strategy call for the {v.tier}{" "}
          {v.track} package.
        </p>
        <p className="mt-4 text-sm text-muted">
          Reference <span className="font-mono font-semibold text-navy-950">{form.reference}</span>
        </p>
        <ol className="mt-8 grid gap-3 sm:grid-cols-3">
          {partnershipSteps.map((s, i) => (
            <li key={s.title} className="rounded-2xl bg-ivory p-5 text-sm">
              <span className="font-display text-2xl text-gold-ink">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-2 font-semibold text-navy-950">{s.title}</p>
              <p className="mt-1 text-muted">{s.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const field = { onChange: form.setField, onBlur: form.blurField };
  const submitting = form.status === "submitting";
  const tiers = tierOptions(v.track);
  const passes = v.tier ? passLimit(v.track, v.tier) : null;
  const isSponsor = v.track === "Official Sponsor";

  return (
    <form
      ref={formRef}
      method="post"
      noValidate
      onSubmit={form.onSubmit}
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
          Your package
        </legend>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <SelectField
            name="track"
            label="Partnership track"
            required
            options={TRACK_OPTIONS}
            value={v.track}
            error={form.errors.track}
            onChange={(_, value) =>
              // A tier from the other track is never valid, so clear it in the same update.
              form.setFields(
                tierOptions(value).includes(v.tier) ? { track: value } : { track: value, tier: "" },
              )
            }
            onBlur={form.blurField}
          />
          <SelectField
            name="tier"
            label="Tier"
            required
            options={tiers}
            placeholder="Select a tier"
            hint={passes !== null ? `Includes up to ${passes} VIP delegate passes.` : undefined}
            value={v.tier}
            error={form.errors.tier}
            {...field}
          />
          {isSponsor && v.tier === "Diamond" && (
            <TextField
              name="exclusivity"
              label="Category exclusivity you want"
              hint="Diamond includes category exclusivity, e.g. Official Telecoms Partner."
              value={v.exclusivity}
              error={form.errors.exclusivity}
              className="sm:col-span-2"
              {...field}
            />
          )}
          <TextAreaField
            name="objectives"
            label="What do you want from the summit?"
            hint={
              isSponsor
                ? "E.g. audiences to reach, activation ideas, leads you want."
                : "E.g. policy areas, the roundtable you would chair, DFIs or ministries to meet."
            }
            rows={4}
            value={v.objectives}
            error={form.errors.objectives}
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
            name="companyName"
            label="Company name"
            autoComplete="organization"
            required
            value={v.companyName}
            error={form.errors.companyName}
            {...field}
          />
          <SelectField
            name="industry"
            label="Industry"
            required
            options={sectors}
            placeholder="Select your industry"
            value={v.industry}
            error={form.errors.industry}
            {...field}
          />
          <TextField
            name="companyWebsite"
            label="Website"
            inputMode="url"
            value={v.companyWebsite}
            error={form.errors.companyWebsite}
            {...field}
          />
          <TextAreaField
            name="billingAddress"
            label="Billing name and address"
            hint="As it should appear on the invoice."
            required
            rows={3}
            value={v.billingAddress}
            error={form.errors.billingAddress}
            className="sm:col-span-2"
            {...field}
          />
        </div>
      </fieldset>

      <fieldset className="mt-10 border-t border-line pt-8">
        <legend className="sr-only">Main contact</legend>
        <p aria-hidden="true" className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">
          Main contact
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <TextField
            name="contactName"
            label="Full name"
            autoComplete="name"
            required
            value={v.contactName}
            error={form.errors.contactName}
            {...field}
          />
          <TextField
            name="jobTitle"
            label="Job title"
            autoComplete="organization-title"
            required
            value={v.jobTitle}
            error={form.errors.jobTitle}
            {...field}
          />
          <TextField
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={v.email}
            error={form.errors.email}
            {...field}
          />
          <TextField
            name="phone"
            label="Phone number"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            value={v.phone}
            error={form.errors.phone}
            {...field}
          />
          <TextField
            name="whatsapp"
            label="WhatsApp number"
            type="tel"
            inputMode="tel"
            hint="Leave blank if it is your phone number."
            value={v.whatsapp}
            error={form.errors.whatsapp}
            {...field}
          />
          <TextField
            name="callAvailability"
            label="Best time for a 15-minute strategy call"
            hint="E.g. weekdays after 2 PM."
            value={v.callAvailability}
            error={form.errors.callAvailability}
            {...field}
          />
        </div>
      </fieldset>

      <fieldset className="mt-10 border-t border-line pt-8">
        <legend className="sr-only">VIP pass holders</legend>
        <p aria-hidden="true" className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">
          VIP pass holders
        </p>
        <TextAreaField
          name="passHolders"
          label="Names and emails of your delegates"
          hint={`One per line: Full name, email@example.com.${
            passes !== null ? ` Up to ${passes} for this tier.` : ""
          } You can also send these later.`}
          rows={5}
          value={v.passHolders}
          error={form.errors.passHolders}
          className="mt-6"
          {...field}
        />
      </fieldset>

      <div className="mt-10 border-t border-line pt-8">
        <div className="flex items-start gap-3">
          <input
            id="f-acknowledge"
            name="acknowledge"
            type="checkbox"
            checked={v.acknowledge === "yes"}
            aria-invalid={form.errors.acknowledge ? true : undefined}
            aria-describedby={form.errors.acknowledge ? "f-acknowledge-error" : undefined}
            onChange={(e) => form.setField("acknowledge", e.target.checked ? "yes" : "")}
            onBlur={() => form.blurField("acknowledge")}
            className="mt-1 size-5 shrink-0 accent-navy-950"
          />
          <label htmlFor="f-acknowledge" className="text-sm leading-relaxed text-ink">
            I understand this request does not reserve a slot. Slots are allocated on a first-commitment basis
            and secured by signed contract and a 50% deposit.
            <span className="text-gold-ink" aria-hidden="true">
              {" "}
              *
            </span>
          </label>
        </div>
        {form.errors.acknowledge && (
          <p id="f-acknowledge-error" className="mt-1.5 pl-8 text-sm font-medium text-red-700">
            {form.errors.acknowledge}
          </p>
        )}
      </div>

      <Honeypot value={v.website} onChange={(val) => form.setField("website", val)} />

      <div className="mt-10 flex flex-col gap-5 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-xs leading-relaxed text-muted">
          Fields marked * are required. Details go only to the convener&apos;s office.
        </p>
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
            "Request this package"
          )}
        </button>
      </div>
      <p aria-live="polite" className="sr-only">
        {submitting ? "Submitting your request" : ""}
      </p>
    </form>
  );
}
