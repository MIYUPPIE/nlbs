"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CircleAlert, CircleCheck, CreditCard, LoaderCircle, Lock, Minus, Plus } from "lucide-react";
import { event } from "@/data/event";
import { seatPayment, seatTotalDisplay } from "@/data/registration-plan";
import {
  delegateTypes,
  guestEmailKey,
  guestNameKey,
  registrationSchema,
  seatCount,
  sectors,
} from "@/lib/registration";
import { startSeatPayment } from "@/lib/central";
import type { Checkout } from "@/lib/forms";
import { buttonClasses } from "@/components/ui/GoldButton";
import { Honeypot, SelectField, TextField } from "@/components/forms/Field";
import { useSubmissionForm } from "@/components/forms/useSubmissionForm";
import { sendForm } from "@/lib/outgoing";
import { useQueryPrefill } from "@/components/hooks/useQueryPrefill";
import { useHydrated } from "@/components/hooks/useHydrated";
import { PrivacyNotice } from "@/components/legal/PrivacyNotice";
import { registrationClosure } from "@/lib/registration-window";
import { usePastRegistrationDeadline } from "@/components/hooks/usePastRegistrationDeadline";

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
  seats: "1",
  ...Object.fromEntries(
    Array.from({ length: seatPayment.maxSeats - 1 }, (_, i) => [
      [guestNameKey(i + 1), ""],
      [guestEmailKey(i + 1), ""],
    ]).flat(),
  ),
  website: "",
};

/** Sends the browser to Paystack. Separate so e2e can stub navigation. */
function goToCheckout(checkout: Checkout) {
  window.location.assign(checkout.url);
}

const pickDelegateType = (raw: string) => ((delegateTypes as readonly string[]).includes(raw) ? raw : null);

export function RegistrationForm() {
  // After a successful registration: the checkout we are sending them to, or why it did not open.
  const [pay, setPay] = useState<{ checkout: Checkout | null; error: string | null } | null>(null);
  const [retrying, setRetrying] = useState(false);
  const { formRef, ...form } = useSubmissionForm(registrationSchema, emptyValues, async (v) => {
    const res = await sendForm("registration", v);
    if (res.ok) {
      setPay({ checkout: res.payment ?? null, error: res.payment ? null : (res.paymentError ?? null) });
      if (res.payment) goToCheckout(res.payment);
    }
    return res;
  });
  const seats = seatCount(form.values.seats);
  const setSeats = (n: number) =>
    form.setField("seats", String(Math.min(seatPayment.maxSeats, Math.max(1, n))));

  const retryPayment = async () => {
    if (!form.reference) return;
    setRetrying(true);
    const res = await startSeatPayment(form.reference);
    if (res.ok) {
      goToCheckout(res.checkout);
      return;
    }
    setRetrying(false);
    setPay({ checkout: null, error: res.error });
  };
  // /register?type=Investor preselects the delegate type.
  useQueryPrefill("type", pickDelegateType, (v) => form.setField("delegateType", v));
  const successRef = useRef<HTMLHeadingElement>(null);
  // Submit stays disabled until hydrated so a pre-hydration submit cannot fire natively.
  const hydrated = useHydrated();

  // A build made before the deadline is still served after it: the visitor's clock decides.
  const pastDeadline = usePastRegistrationDeadline();

  useEffect(() => {
    if (form.status === "success") successRef.current?.focus();
  }, [form.status]);

  if (pastDeadline && form.status !== "success") {
    return (
      <div
        role="status"
        data-registration="closed"
        className="rounded-3xl border border-line bg-white p-8 sm:p-12"
      >
        <h2 className="font-display text-4xl text-navy-950">{registrationClosure.title}</h2>
        <p className="mt-3 max-w-lg text-muted">
          Registration closed on{" "}
          <time dateTime={registrationClosure.closedIso}>{registrationClosure.closed}</time>. Only delegates
          with a paid seat are admitted, and there is no on-site registration.
        </p>
      </div>
    );
  }

  if (form.status === "success") {
    const payUrl = `${seatPayment.payPath}?ref=${encodeURIComponent(form.reference ?? "")}`;
    const total = seatTotalDisplay(seats);
    if (pay?.checkout) {
      return (
        <div role="status" className="rounded-3xl border border-gold/50 bg-white p-8 text-center sm:p-12">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-navy-950 text-gold">
            <LoaderCircle aria-hidden="true" className="size-8 animate-spin" />
          </span>
          <h2
            ref={successRef}
            tabIndex={-1}
            className="mt-6 font-display text-4xl text-navy-950 outline-none"
          >
            Taking you to payment
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Your registration is saved (reference{" "}
            <span className="font-mono font-semibold text-navy-950">{form.reference}</span>). Pay {total} with{" "}
            {seatPayment.provider} to confirm {seats === 1 ? "your seat" : `all ${seats} seats`}.
          </p>
          <a href={pay.checkout.url} className={buttonClasses("gold", "lg", "mt-8")}>
            <CreditCard aria-hidden="true" className="size-4" />
            Continue to payment
          </a>
        </div>
      );
    }
    return (
      <div role="status" className="rounded-3xl border border-gold/50 bg-white p-8 text-center sm:p-12">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-navy-950 text-gold">
          <CircleCheck aria-hidden="true" className="size-8" />
        </span>
        <h2 ref={successRef} tabIndex={-1} className="mt-6 font-display text-4xl text-navy-950 outline-none">
          Registration saved. One step left.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Thank you, {form.values.fullName.split(" ")[0]}. Your seat is not confirmed until you pay {total}.
        </p>
        {pay?.error && (
          <p className="mx-auto mt-4 flex max-w-md items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-left text-sm text-red-800">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {pay.error}
          </p>
        )}
        <dl className="mx-auto mt-8 grid max-w-sm gap-3 rounded-2xl bg-ivory p-5 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Reference</dt>
            <dd className="font-mono font-semibold text-navy-950">{form.reference}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Seats</dt>
            <dd className="text-right text-navy-950">
              {seats} × {seatPayment.priceDisplay} = <strong>{total}</strong>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Date</dt>
            <dd className="text-right text-navy-950">{event.date.display}</dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={retryPayment}
            disabled={retrying}
            className={buttonClasses("gold", "lg", "disabled:cursor-wait disabled:opacity-80")}
          >
            {retrying ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <CreditCard aria-hidden="true" className="size-4" />
            )}
            Pay {total} now
          </button>
          <Link href={payUrl} className={buttonClasses("outline-dark", "lg")}>
            Pay later with my reference
          </Link>
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

      <fieldset className="mt-10 border-t border-line pt-8" aria-describedby="seats-help">
        <legend className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">Seats</legend>
        <div className="mt-6 flex flex-col gap-5 rounded-2xl bg-ivory p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-navy-950">How many seats?</p>
            <p id="seats-help" className="mt-1 text-sm text-muted">
              {seatPayment.priceDisplay} per delegate. You are seat 1; add colleagues and pay for everyone in
              one go (up to {seatPayment.maxSeats}).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSeats(seats - 1)}
              disabled={seats <= 1}
              aria-label="One seat fewer"
              className="flex size-11 items-center justify-center rounded-full border border-line bg-white text-navy-950 disabled:opacity-40"
            >
              <Minus aria-hidden="true" className="size-4" />
            </button>
            <output
              aria-live="polite"
              aria-label={`${seats} ${seats === 1 ? "seat" : "seats"}`}
              data-testid="seat-count"
              className="w-10 text-center font-display text-3xl text-navy-950"
            >
              {seats}
            </output>
            <button
              type="button"
              onClick={() => setSeats(seats + 1)}
              disabled={seats >= seatPayment.maxSeats}
              aria-label="One seat more"
              className="flex size-11 items-center justify-center rounded-full border border-line bg-white text-navy-950 disabled:opacity-40"
            >
              <Plus aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
        {seats > 1 && (
          <ol className="mt-6 space-y-5" aria-label="Your guests">
            {Array.from({ length: seats - 1 }, (_, i) => i + 1).map((n) => (
              <li key={n} className="grid gap-4 rounded-2xl border border-line p-5 sm:grid-cols-2">
                <p className="text-xs font-semibold tracking-[0.18em] text-gold-ink uppercase sm:col-span-2">
                  Seat {n + 1}
                </p>
                <TextField
                  name={guestNameKey(n)}
                  label={`Guest ${n} full name`}
                  autoComplete="off"
                  required
                  value={form.values[guestNameKey(n)]}
                  error={form.errors[guestNameKey(n)]}
                  {...field}
                />
                <TextField
                  name={guestEmailKey(n)}
                  label={`Guest ${n} email`}
                  type="email"
                  inputMode="email"
                  autoComplete="off"
                  required
                  hint="Their seat confirmation goes here."
                  value={form.values[guestEmailKey(n)]}
                  error={form.errors[guestEmailKey(n)]}
                  {...field}
                />
              </li>
            ))}
          </ol>
        )}
      </fieldset>

      <fieldset className="mt-10 border-t border-line pt-8">
        <legend className="sr-only">A few more details</legend>
        <p aria-hidden="true" className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">
          A few more details
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

      <div
        data-testid="order-total"
        className="mt-10 flex items-center justify-between gap-4 rounded-2xl bg-navy-950 p-5 text-white"
      >
        <div>
          <p className="text-sm text-mist">
            {seats} {seats === 1 ? "seat" : "seats"} × {seatPayment.priceDisplay}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-mist">
            <Lock aria-hidden="true" className="size-3.5 text-gold" />
            Secure payment by {seatPayment.provider}
          </p>
          <p className="mt-1 text-xs text-mist" data-testid="refund-rule">
            {seatPayment.refunds}{" "}
            <Link href="/terms#registration" className="underline">
              Terms
            </Link>
          </p>
        </div>
        <p className="font-display text-3xl text-gold">{seatTotalDisplay(seats)}</p>
      </div>

      <div className="mt-8 flex flex-col gap-5 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <PrivacyNotice
          id="registration-note"
          purpose="Fields marked * are required. Your details (and your guests') are used only to take payment for your seats and manage your participation in the summit."
        />
        <button
          type="submit"
          disabled={submitting || !hydrated}
          className={buttonClasses("gold", "lg", "w-full disabled:cursor-wait disabled:opacity-80 sm:w-auto")}
        >
          {submitting ? (
            <>
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              Saving your seats…
            </>
          ) : (
            <>
              <CreditCard aria-hidden="true" className="size-4" />
              Continue to payment · {seatTotalDisplay(seats)}
            </>
          )}
        </button>
      </div>
      <p aria-live="polite" className="sr-only">
        {submitting ? "Saving your registration" : ""}
      </p>
    </form>
  );
}
