"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  CircleCheck,
  CreditCard,
  LoaderCircle,
  Lock,
} from "lucide-react";
import { event } from "@/data/event";
import { classPayment, delegateClasses } from "@/data/registration-plan";
import { fetchClassAvailability, type ClassAvailability } from "@/lib/central";
import type { Checkout } from "@/lib/forms";
import { delegateTypes, registrationSchema, sectors } from "@/lib/registration";
import { buttonClasses } from "@/components/ui/GoldButton";
import { Honeypot, SelectField, TextField } from "@/components/forms/Field";
import { useSubmissionForm } from "@/components/forms/useSubmissionForm";
import { sendForm } from "@/lib/outgoing";
import { useQueryPrefill } from "@/components/hooks/useQueryPrefill";
import { useHydrated } from "@/components/hooks/useHydrated";
import { PrivacyNotice } from "@/components/legal/PrivacyNotice";
import { BookOffer } from "@/components/forms/BookOffer";
import { closesAtMs, registrationClosure } from "@/lib/registration-window";

const noopSubscribe = () => () => {};

const forcedOpen = process.env.NEXT_PUBLIC_REGISTRATION_OVERRIDE === "open";

/**
 * False on the server and during hydration; afterwards, whether the visitor's
 * clock is past the deadline. A build forced open (e2e) ignores the clock.
 */
function usePastRegistrationDeadline(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => !forcedOpen && Date.now() >= closesAtMs,
    () => false,
  );
}

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
  tier: "",
  website: "",
};

/** Sends the browser to Paystack (separate so the flow is easy to follow and test). */
function goToCheckout(checkout: Checkout) {
  window.location.assign(checkout.url);
}

const pickClass = (raw: string) => (delegateClasses.some((c) => c.key === raw && c.open) ? raw : null);

const pickDelegateType = (raw: string) => ((delegateTypes as readonly string[]).includes(raw) ? raw : null);

export function RegistrationForm() {
  // After a successful registration: the Paystack checkout we are sending them to, or why it did not open.
  const [pay, setPay] = useState<{
    checkout: Checkout | null;
    error: string | null;
    payUrl: string | null;
  } | null>(null);
  const { formRef, ...form } = useSubmissionForm(registrationSchema, emptyValues, async (v) => {
    const res = await sendForm("registration", v);
    if (res.ok) {
      setPay({ checkout: res.payment ?? null, error: res.paymentError ?? null, payUrl: res.payUrl ?? null });
      if (res.payment) goToCheckout(res.payment);
    }
    return res;
  });
  // Live seats per class (null: unknown, every open class is offered and the backend still checks).
  const [availability, setAvailability] = useState<Map<string, ClassAvailability> | null>(null);
  useEffect(() => {
    let live = true;
    void fetchClassAvailability().then((a) => live && setAvailability(a));
    return () => {
      live = false;
    };
  }, []);
  const isFull = (key: string) => availability?.get(key)?.open === false;
  const chosen = delegateClasses.find((c) => c.key === form.values.tier);
  // /register?class=vip preselects a class.
  useQueryPrefill("class", pickClass, (v) => form.setField("tier", v));
  // /register?type=Investor preselects the delegate type.
  useQueryPrefill("type", pickDelegateType, (v) => form.setField("delegateType", v));
  const successRef = useRef<HTMLHeadingElement>(null);
  // Step 1 collects the class and details (no prices); step 2 is the payment page.
  const [step, setStep] = useState<"details" | "payment">("details");
  // The backend refused a detail (e.g. a taken email): show step 1 again so they can fix it.
  const view =
    step === "payment" && !(form.status === "error" && Object.values(form.errors).some(Boolean))
      ? "payment"
      : "details";
  const stepRef = useRef<HTMLHeadingElement>(null);
  const stepChanged = useRef(false);
  const goTo = (next: "details" | "payment") => {
    stepChanged.current = true;
    setStep(next);
  };
  useEffect(() => {
    if (!stepChanged.current) return;
    stepChanged.current = false;
    stepRef.current?.focus();
    stepRef.current?.scrollIntoView({ block: "start" });
  }, [view]);

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
          <time dateTime={registrationClosure.closedIso}>{registrationClosure.closed}</time>. Seats are by
          confirmed invitation only, and there is no on-site registration.
        </p>
      </div>
    );
  }

  if (form.status === "success") {
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
            <span className="font-mono font-semibold text-navy-950">{form.reference}</span>). Pay{" "}
            {chosen?.priceDisplay} for your {chosen?.label} seat with {classPayment.provider}.
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
          Thank you, {form.values.fullName.split(" ")[0]}. Your {chosen?.label} seat is confirmed when you pay{" "}
          {chosen?.priceDisplay}.
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
            <dt className="text-muted">Class</dt>
            <dd className="text-right text-navy-950">
              {chosen?.label} · {chosen?.priceDisplay}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Date</dt>
            <dd className="text-right text-navy-950">{event.date.display}</dd>
          </div>
        </dl>
        {pay?.payUrl && (
          <a href={pay.payUrl} className={buttonClasses("gold", "lg", "mt-8")}>
            <CreditCard aria-hidden="true" className="size-4" />
            Pay {chosen?.priceDisplay} now
          </a>
        )}
        <BookOffer campaign="registration_received" />
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
      onSubmit={(e) => {
        if (view === "payment") return form.onSubmit(e);
        e.preventDefault();
        if (form.validate()) goTo("payment");
      }}
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

      <p className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase" data-testid="step-label">
        Step {view === "details" ? 1 : 2} of 2
      </p>
      <h2 ref={stepRef} tabIndex={-1} className="mt-2 mb-8 font-display text-3xl text-navy-950 outline-none">
        {view === "details" ? "Your class and details" : "Payment"}
      </h2>

      <div hidden={view !== "details"} data-testid="step-details">
        <fieldset aria-describedby={form.errors.tier ? "f-tier-error" : "f-tier-hint"}>
          <legend className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">
            Your class
          </legend>
          <p id="f-tier-hint" className="mt-2 text-sm text-muted">
            Seats are limited in each class. {classPayment.confirmed}
          </p>
          <div role="radiogroup" aria-label="Delegate class" className="mt-5 grid gap-3 sm:grid-cols-2">
            {delegateClasses.map((c) => {
              const full = !c.open || isFull(c.key);
              const selected = form.values.tier === c.key;
              return (
                <label
                  key={c.key}
                  data-testid={`class-${c.key}`}
                  className={`relative flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition-colors ${
                    full
                      ? "cursor-not-allowed border-line bg-ivory opacity-60"
                      : selected
                        ? "border-gold bg-gold/10 ring-2 ring-gold"
                        : "border-line bg-white hover:border-gold/60"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="tier"
                      value={c.key}
                      checked={selected}
                      disabled={full}
                      onChange={() => form.setField("tier", c.key)}
                      onBlur={() => form.blurField("tier")}
                      className="size-5 accent-navy-950"
                    />
                    <span className="font-semibold text-navy-950">{c.label}</span>
                  </span>
                  {full && <span className="text-xs font-semibold text-red-700 uppercase">Full</span>}
                </label>
              );
            })}
          </div>
          {form.errors.tier && (
            <p id="f-tier-error" role="alert" className="mt-2 text-sm font-medium text-red-700">
              {form.errors.tier}
            </p>
          )}
        </fieldset>

        <fieldset className="mt-10 border-t border-line pt-8">
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
                  religious information) only to arrange catering and access for me. I can withdraw this at
                  any time.
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
      </div>

      <Honeypot value={form.values.website} onChange={(v) => form.setField("website", v)} />

      {view === "payment" && chosen && (
        <div data-testid="step-payment">
          <dl className="grid gap-3 rounded-2xl bg-ivory p-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Delegate</dt>
              <dd className="text-right text-navy-950">{form.values.fullName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Email</dt>
              <dd className="text-right break-all text-navy-950">{form.values.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Date</dt>
              <dd className="text-right text-navy-950">{event.date.display}</dd>
            </div>
          </dl>
          <div
            data-testid="order-total"
            className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-navy-950 p-5 text-white"
          >
            <div>
              <p className="text-sm text-mist">{chosen.label} seat</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-mist">
                <Lock aria-hidden="true" className="size-3.5 text-gold" />
                Secure payment by {classPayment.provider}
              </p>
              <p className="mt-1 text-xs text-mist" data-testid="refund-rule">
                {classPayment.refunds}{" "}
                <Link href="/terms#registration" className="underline">
                  Terms
                </Link>
              </p>
            </div>
            <p className="font-display text-3xl text-gold">{chosen.priceDisplay}</p>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-5 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <PrivacyNotice
          id="registration-note"
          purpose="Fields marked * are required. Your details are used only to take payment for your seat and manage your participation in the summit."
        />
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row-reverse">
          {view === "payment" && chosen ? (
            <>
              <button
                type="submit"
                disabled={submitting || !hydrated}
                className={buttonClasses(
                  "gold",
                  "lg",
                  "w-full disabled:cursor-wait disabled:opacity-80 sm:w-auto",
                )}
              >
                {submitting ? (
                  <>
                    <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                    Saving your registration…
                  </>
                ) : (
                  <>
                    <CreditCard aria-hidden="true" className="size-4" />
                    Continue to payment · {chosen.priceDisplay}
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => goTo("details")}
                className={buttonClasses("outline-dark", "lg", "w-full sm:w-auto")}
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
                Back
              </button>
            </>
          ) : (
            <button
              type="submit"
              disabled={!hydrated}
              className={buttonClasses(
                "gold",
                "lg",
                "w-full disabled:cursor-wait disabled:opacity-80 sm:w-auto",
              )}
            >
              {chosen ? (
                <>
                  Next: payment
                  <ArrowRight aria-hidden="true" className="size-4" />
                </>
              ) : (
                "Choose your class to continue"
              )}
            </button>
          )}
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {submitting ? "Submitting your request" : ""}
      </p>
    </form>
  );
}
