"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  CircleCheck,
  ExternalLink,
  FileText,
  LoaderCircle,
  Upload,
  Video,
  X,
} from "lucide-react";
import {
  AGE_BANDS,
  CAC_STATUS,
  conditionalErrors,
  CV_MAX_BYTES,
  countWords,
  DEVICES,
  eligibility,
  MONTHLY_REVENUE,
  NIGERIAN_STATES,
  NOT_ELIGIBLE,
  PITCH_MAX_WORDS,
  PROBLEM_MAX,
  REFERRALS,
  SKILL_LEVELS,
  SKILLS,
  talentApplicationSchema,
  TRACK_DETAILS,
  TRACKS,
  YES_NO,
  type CvUpload,
  BOOK_PREORDER,
  bookPreorderUrl,
  normalizeNigerianMobile,
  normalizePreorderReference,
} from "@/lib/talent-form";
import { checkPreorder } from "@/lib/central";
import { PRIVACY_PATHS } from "@/lib/privacy";
import { siteUrl } from "@/lib/site";
import { sendForm } from "@/lib/outgoing";
import { Honeypot, SelectField, TextAreaField, TextField } from "@/components/forms/Field";
import { useHydrated } from "@/components/hooks/useHydrated";
import { buttonClasses } from "@/components/ui/GoldButton";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

type Values = Record<string, string | boolean | CvUpload | null>;

const EMPTY: Values = {
  fullName: "",
  whatsapp: "",
  email: "",
  state: "",
  ageBand: "",
  referral: "",
  referralPartner: "",
  track: "",
  skillLevel: "",
  problem: "",
  videoUrl: "",
  skill: "",
  cv: null,
  portfolioUrl: "",
  businessName: "",
  cacStatus: "",
  monthlyRevenue: "",
  available: "",
  priorSupport: "",
  priorSupportFrom: "",
  devices: "",
  pitch: "",
  consent: false,
  preorderReference: "",
  website: "",
};

const RETURN_URL = `${siteUrl}/talentnigeria20/`;

type PreorderState = { status: "idle" | "checking" | "valid" | "invalid"; key?: string };

/** What a confirmed pre-order was checked against; editing any of it needs a new check. */
const preorderKey = (v: Values) =>
  [
    normalizePreorderReference(String(v.preorderReference ?? "")) ?? "",
    String(v.email ?? "")
      .trim()
      .toLowerCase(),
    normalizeNigerianMobile(String(v.whatsapp ?? "")) ?? String(v.whatsapp ?? ""),
  ].join("|");

const STEPS = [
  {
    title: "Who are you?",
    fields: ["fullName", "whatsapp", "email", "state", "ageBand", "referral", "referralPartner"],
  },
  // Required between who you are (eligibility known) and the rest of the form.
  { title: "Pre-order the book", fields: ["preorderReference"] },
  { title: "Which track?", fields: ["track"] },
  {
    title: "The filter questions",
    fields: [
      "skillLevel",
      "problem",
      "videoUrl",
      "skill",
      "cv",
      "portfolioUrl",
      "businessName",
      "cacStatus",
      "monthlyRevenue",
      "available",
      "priorSupport",
      "priorSupportFrom",
      "devices",
      "pitch",
      "consent",
    ],
  },
] as const;

const TRACK_ICONS: Record<string, IconName> = { Skills: "graduation", Jobs: "briefcase", Capital: "wallet" };
const DRAFT_KEY = "n2-talent-application-draft";

function allErrors(values: Values): Record<string, string> {
  const out: Record<string, string> = {};
  const parsed = talentApplicationSchema.safeParse(values);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const k = issue.path[0];
      if (typeof k === "string" && !out[k]) out[k] = issue.message;
    }
  }
  for (const [k, v] of Object.entries(conditionalErrors(values))) if (!out[k]) out[k] = v;
  return out;
}

function stepErrors(values: Values, step: number) {
  const all = allErrors(values);
  return Object.fromEntries(
    Object.entries(all).filter(([k]) => (STEPS[step].fields as readonly string[]).includes(k)),
  );
}

/** Radio group rendered as selectable cards. */
function Choice({
  name,
  legend,
  options,
  value,
  error,
  onChange,
  columns = 1,
  hint,
}: {
  name: string;
  legend: string;
  options: readonly string[];
  value: string;
  error?: string;
  onChange: (v: string) => void;
  columns?: 1 | 2 | 3 | 4;
  hint?: string;
}) {
  return (
    <fieldset aria-describedby={error ? `f-${name}-error` : undefined}>
      <legend className="mb-2 text-sm font-semibold text-navy-950">
        {legend}
        <span className="text-gold-ink" aria-hidden="true">
          {" "}
          *
        </span>
      </legend>
      {hint && <p className="-mt-1 mb-3 text-xs text-muted">{hint}</p>}
      <div
        className={cn(
          "grid gap-2",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-3",
          columns === 4 && "grid-cols-2 sm:grid-cols-4",
        )}
      >
        {options.map((o) => {
          const checked = value === o;
          return (
            <label
              key={o}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-navy-700/30",
                checked
                  ? "border-navy-950 bg-navy-950 text-white"
                  : "border-line bg-white text-ink hover:border-gold/60",
              )}
            >
              <input
                type="radio"
                name={name}
                value={o}
                checked={checked}
                onChange={() => onChange(o)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border",
                  checked ? "border-gold" : "border-muted/50",
                )}
              >
                {checked && <span className="size-2 rounded-full bg-gold" />}
              </span>
              {o}
            </label>
          );
        })}
      </div>
      {error && (
        <p id={`f-${name}-error`} className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function NotEligible({ onBack }: { onBack: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-line bg-ivory p-6">
      <p className="font-display text-2xl text-navy-950">{NOT_ELIGIBLE}</p>
      <p className="mt-2 text-sm text-muted">
        The 2026 Talent Fund is for Nigerians aged 18 to 35 who can commit 5 hours per week for 12 weeks. You
        can still take part in Nigeria 2.0 by registering as a delegate.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onBack} className={buttonClasses("outline-dark")}>
          Change my answer
        </button>
        <Link href="/register?type=Student%20%2F%20Young%20Professional" className={buttonClasses("gold")}>
          Register for the summit
        </Link>
      </div>
    </div>
  );
}

export function TalentApplicationForm() {
  const hydrated = useHydrated();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [preorder, setPreorder] = useState<PreorderState>({ status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /** Confirms the pre-order with the backend. Returns true when it qualifies. */
  const verifyPreorder = async (v: Values): Promise<boolean> => {
    const ref = normalizePreorderReference(String(v.preorderReference ?? ""));
    if (!ref) {
      setPreorder({ status: "invalid" });
      setErrors((o) => ({
        ...o,
        preorderReference: "Enter your pre-order reference, for example BK-7K4Q-9XPA.",
      }));
      return false;
    }
    setPreorder({ status: "checking" });
    setErrors((o) => ({ ...o, preorderReference: "" }));
    const whatsapp = String(v.whatsapp ?? "");
    const res = await checkPreorder(ref, {
      email: String(v.email ?? "").trim(),
      whatsapp: normalizeNigerianMobile(whatsapp) ?? whatsapp,
    });
    if (res.valid) {
      setValues((cur) => ({ ...cur, preorderReference: ref }));
      setPreorder({ status: "valid", key: preorderKey({ ...v, preorderReference: ref }) });
      return true;
    }
    setPreorder({ status: "invalid" });
    setErrors((o) => ({ ...o, preorderReference: res.message }));
    return false;
  };

  // Restore a saved draft (text answers only; the CV is never stored), and
  // pick up ?preorder=BK-... when the book site sends the applicant back.
  useEffect(() => {
    let draft: Values | null = null;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) draft = JSON.parse(raw) as Values;
    } catch {
      /* storage unavailable */
    }
    const incoming = normalizePreorderReference(
      new URLSearchParams(window.location.search).get("preorder") ?? "",
    );
    if (incoming) window.history.replaceState(null, "", window.location.pathname + window.location.hash);
    const frame = requestAnimationFrame(() => {
      const merged: Values = {
        ...EMPTY,
        ...(draft ?? {}),
        cv: null,
        website: "",
        ...(incoming ? { preorderReference: incoming } : {}),
      };
      if (draft || incoming) setValues((v) => ({ ...v, ...merged, cv: v.cv }));
      if (draft) setRestored(true);
      // Back from the book site with Section 1 already done: go straight to the check.
      if (
        incoming &&
        Object.keys(stepErrors(merged, 0)).length === 0 &&
        eligibility(merged as never).eligible
      ) {
        setStep(1);
        void verifyPreorder(merged);
      }
    });
    return () => cancelAnimationFrame(frame);
    // Runs once on mount; verifyPreorder only uses state setters.
  }, []);

  useEffect(() => {
    if (status === "success") return;
    const timer = window.setTimeout(() => {
      try {
        const { cv: _cv, website: _w, ...rest } = values;
        void _cv;
        void _w;
        localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
      } catch {
        /* storage unavailable */
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [values, status]);

  const set = (name: string, value: Values[string]) => {
    const next = { ...values, [name]: value };
    setValues(next);
    // Re-validate a field live once it has been shown an error.
    if (errors[name] !== undefined) {
      const e = allErrors(next);
      setErrors((old) => ({ ...old, [name]: e[name] ?? "" }));
    }
  };
  const text = (name: string) => (values[name] as string) ?? "";
  const blur = (name: string) => {
    const e = allErrors(values);
    setErrors((old) => ({ ...old, [name]: e[name] ?? "" }));
  };
  const field = { onChange: (n: string, v: string) => set(n, v), onBlur: blur };

  const preorderConfirmed = preorder.status === "valid" && preorder.key === preorderKey(values);

  const elig = eligibility({
    ageBand: text("ageBand") as never,
    available: text("available") as never,
  });

  const focusFirst = (errs: Record<string, string>) => {
    const first = Object.keys(errs).find((k) => errs[k]);
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(`[name="${first}"], #f-${first}`);
    el?.focus();
  };

  const goTo = (next: number) => {
    setStep(next);
    setFormError(null);
    requestAnimationFrame(() => {
      headingRef.current?.focus();
      headingRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  };

  const next = async () => {
    if (step === 1) {
      if (preorderConfirmed || (await verifyPreorder(values))) return goTo(2);
      setFormError("Pre-order the book, then confirm your reference to continue.");
      formRef.current?.querySelector<HTMLElement>("#f-preorderReference")?.focus();
      return;
    }
    const e = stepErrors(values, step);
    setErrors((old) => ({ ...old, ...e }));
    if (Object.keys(e).length) {
      setFormError("Please complete the highlighted questions.");
      focusFirst(e);
      return;
    }
    goTo(step + 1);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setErrors((o) => ({ ...o, cv: "Your CV must be a PDF." }));
      return;
    }
    if (file.size > CV_MAX_BYTES) {
      setErrors((o) => ({ ...o, cv: "Your CV must be 2 MB or smaller." }));
      return;
    }
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    set("cv", { name: file.name, type: "application/pdf", size: file.size, data });
    setErrors((o) => ({ ...o, cv: "" }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) return next();
    if (!elig.eligible || status === "submitting") return;
    const errs = allErrors(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const firstStep = STEPS.findIndex((s) =>
        Object.keys(errs).some((k) => (s.fields as readonly string[]).includes(k)),
      );
      if (firstStep !== -1 && firstStep !== step) goTo(firstStep);
      setFormError("Please complete the highlighted questions.");
      requestAnimationFrame(() => focusFirst(errs));
      return;
    }
    if (!preorderConfirmed) {
      goTo(1);
      setFormError("Confirm your book pre-order before submitting.");
      return;
    }
    setStatus("submitting");
    setFormError(null);
    const res = await sendForm("talent", values);
    if (res.ok) {
      setReference(res.reference);
      setStatus("success");
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      requestAnimationFrame(() => headingRef.current?.focus());
      return;
    }
    setStatus("error");
    setFormError(res.error);
    if (res.fieldErrors) {
      if (res.fieldErrors.preorderReference) setPreorder({ status: "invalid" });
      setErrors(res.fieldErrors);
      const firstStep = STEPS.findIndex((s) =>
        Object.keys(res.fieldErrors!).some((k) => (s.fields as readonly string[]).includes(k)),
      );
      if (firstStep !== -1) goTo(firstStep);
    }
  };

  if (status === "success") {
    return (
      <div role="status" className="rounded-3xl border border-gold/50 bg-white p-8 text-center sm:p-12">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-navy-950 text-gold">
          <CircleCheck aria-hidden="true" className="size-8" />
        </span>
        <h2 ref={headingRef} tabIndex={-1} className="mt-6 font-display text-4xl text-navy-950 outline-none">
          Application received
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Thank you, {text("fullName").split(" ")[0]}. Your application to the Nigeria 2.0 Talent Fund is in.
          Shortlisted applicants will be contacted on WhatsApp for round 2.
        </p>
        <p className="mt-6 text-sm text-muted">
          Reference <span className="font-mono font-semibold text-navy-950">{reference}</span>
        </p>
        <p className="mt-1 text-xs text-muted">Keep this reference for any follow-up.</p>
        <Link href="/talent" className={buttonClasses("outline-dark", "md", "mt-8")}>
          Back to the Talent Fund
        </Link>
      </div>
    );
  }

  const track = text("track");
  const problemLen = text("problem").length;
  const pitchWords = countWords(text("pitch"));
  const cv = values.cv as CvUpload | null;
  const progress = ((step + 1) / STEPS.length) * 100;
  const submitting = status === "submitting";

  return (
    <form
      ref={formRef}
      method="post"
      noValidate
      onSubmit={onSubmit}
      className="rounded-3xl border border-line bg-white p-5 sm:p-10"
    >
      {/* Progress */}
      <div>
        <ol className="grid grid-cols-4 gap-2" aria-label="Application progress">
          {STEPS.map((s, i) => (
            <li key={s.title} aria-current={i === step ? "step" : undefined}>
              <span className={cn("block h-1.5 rounded-full", i <= step ? "bg-gold" : "bg-line")} />
              <span
                className={cn(
                  "mt-2 block text-[0.65rem] font-semibold tracking-[0.14em] uppercase sm:text-xs",
                  i === step ? "text-navy-950" : "text-muted",
                )}
              >
                <span className="sr-only">Step </span>
                {i + 1}
                <span className="hidden sm:inline">. {s.title}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="sr-only" aria-live="polite">
          Step {step + 1} of {STEPS.length}: {STEPS[step].title}, {Math.round(progress)}% complete
        </p>
      </div>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-8 scroll-mt-28 font-display text-3xl text-navy-950 outline-none sm:text-4xl"
      >
        <span className="text-gold-ink">Section {step + 1}.</span> {STEPS[step].title}
      </h2>

      {restored && step === 0 && (
        <p className="mt-3 text-sm text-muted">We restored the answers you started earlier on this device.</p>
      )}

      {formError && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>{formError}</p>
        </div>
      )}

      <div className="mt-8 space-y-7">
        {step === 0 && (
          <>
            <TextField
              name="fullName"
              label="1. Full Name"
              autoComplete="name"
              required
              value={text("fullName")}
              error={errors.fullName}
              {...field}
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                name="whatsapp"
                label="2. WhatsApp Number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                hint="Starts with 070, 080, 081, 090 or 091."
                value={text("whatsapp")}
                error={errors.whatsapp}
                {...field}
              />
              <TextField
                name="email"
                label="3. Email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={text("email")}
                error={errors.email}
                {...field}
              />
            </div>
            <SelectField
              name="state"
              label="4. State of Residence"
              required
              options={NIGERIAN_STATES}
              placeholder="Select your state"
              value={text("state")}
              error={errors.state}
              {...field}
            />
            <Choice
              name="ageBand"
              legend="5. Age"
              options={AGE_BANDS}
              columns={4}
              value={text("ageBand")}
              error={errors.ageBand}
              onChange={(v) => set("ageBand", v)}
            />
            {elig.reason === "age" && <NotEligible onBack={() => set("ageBand", "")} />}
            <SelectField
              name="referral"
              label="6. Who referred you?"
              required
              options={REFERRALS}
              placeholder="Select one"
              value={text("referral")}
              error={errors.referral}
              {...field}
            />
            {text("referral") === "Platinum Partner" && (
              <TextField
                name="referralPartner"
                label="Which Platinum Partner?"
                required
                value={text("referralPartner")}
                error={errors.referralPartner}
                {...field}
              />
            )}
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid gap-6 rounded-2xl bg-navy-950 p-6 text-white sm:grid-cols-[auto_1fr] sm:p-8">
              <Image
                src="/brand/advising-the-founder.webp"
                alt={`${BOOK_PREORDER.title} by ${BOOK_PREORDER.author}, book cover`}
                width={360}
                height={540}
                className="h-auto w-24 rounded-md shadow-lg ring-1 ring-white/10 sm:w-28"
              />
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">
                  Required before you continue
                </p>
                <h3 className="mt-2 font-display text-3xl leading-tight">Pre-order {BOOK_PREORDER.title}</h3>
                <p className="mt-1 text-sm text-mist">
                  by {BOOK_PREORDER.author}, convener of Nigeria 2.0 · Paperback · {BOOK_PREORDER.price}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white/85">
                  Every Talent Fund applicant pre-orders the book before continuing. One copy covers one
                  application. Pre-order with the same email or WhatsApp number you gave in Section 1, so we
                  can match it to you.
                </p>
                <a
                  href={bookPreorderUrl(
                    { fullName: text("fullName"), email: text("email"), whatsapp: text("whatsapp") },
                    RETURN_URL,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses("gold", "md", "mt-6")}
                >
                  Pre-order the book
                  <ExternalLink aria-hidden="true" className="size-4" />
                  <span className="sr-only">(opens advisingthefounder.com in a new tab)</span>
                </a>
              </div>
            </div>

            <ol className="grid gap-3 text-sm sm:grid-cols-3">
              {[
                "Pre-order and pay on advisingthefounder.com.",
                "Tap \u201cContinue your Talent Fund application\u201d, or copy your reference (BK-\u2026) from the confirmation page or email.",
                "Enter the reference below and confirm it.",
              ].map((line, i) => (
                <li key={line} className="flex gap-3 rounded-xl bg-ivory p-4 text-ink/80">
                  <span className="font-display text-xl leading-none text-gold-ink">{i + 1}</span>
                  {line}
                </li>
              ))}
            </ol>

            <div>
              <TextField
                name="preorderReference"
                label="Your pre-order reference"
                required
                hint="Starts with BK-, for example BK-7K4Q-9XPA."
                value={text("preorderReference")}
                error={errors.preorderReference}
                onChange={(n, v) => set(n, v.toUpperCase())}
                onBlur={() => {}}
              />
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => void verifyPreorder(values)}
                  disabled={!hydrated || preorder.status === "checking"}
                  className={buttonClasses("outline-dark", "md", "disabled:opacity-60")}
                >
                  {preorder.status === "checking" ? (
                    <>
                      <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                      Checking…
                    </>
                  ) : (
                    "Confirm my pre-order"
                  )}
                </button>
                <p aria-live="polite" className="text-sm">
                  {preorderConfirmed && (
                    <span className="inline-flex items-center gap-2 font-semibold text-green-800">
                      <CircleCheck aria-hidden="true" className="size-4" />
                      Pre-order confirmed. You can continue.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <fieldset aria-describedby={errors.track ? "f-track-error" : undefined}>
            <legend className="mb-3 text-sm font-semibold text-navy-950">
              7. Choose your track <span className="font-normal text-muted">(choose 1 only)</span>
            </legend>
            <div className="grid gap-3 md:grid-cols-3">
              {TRACKS.map((t) => {
                const checked = track === t;
                return (
                  <label
                    key={t}
                    className={cn(
                      "relative flex cursor-pointer flex-col rounded-2xl border p-5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-navy-700/30",
                      checked
                        ? "border-navy-950 bg-navy-950 text-white"
                        : "border-line bg-ivory hover:border-gold/60",
                    )}
                  >
                    <input
                      type="radio"
                      name="track"
                      value={t}
                      checked={checked}
                      onChange={() => set("track", t)}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        "flex size-11 items-center justify-center rounded-xl",
                        checked ? "bg-gold text-navy-950" : "bg-navy-950 text-gold",
                      )}
                    >
                      <Icon name={TRACK_ICONS[t]} className="size-5" />
                    </span>
                    <span className="mt-4 font-display text-3xl">{TRACK_DETAILS[t].title}</span>
                    <span className={cn("mt-1 text-sm", checked ? "text-white/85" : "text-ink/80")}>
                      {TRACK_DETAILS[t].body}
                    </span>
                    <span
                      className={cn(
                        "mt-3 text-xs font-semibold tracking-[0.12em] uppercase",
                        checked ? "text-gold" : "text-gold-ink",
                      )}
                    >
                      {TRACK_DETAILS[t].note}
                    </span>
                    {checked && (
                      <CircleCheck aria-hidden="true" className="absolute top-4 right-4 size-5 text-gold" />
                    )}
                  </label>
                );
              })}
            </div>
            {errors.track && (
              <p id="f-track-error" className="mt-2 text-sm font-medium text-red-700">
                {errors.track}
              </p>
            )}
          </fieldset>
        )}

        {step === 3 && (
          <>
            <p className="rounded-xl bg-ivory px-4 py-3 text-sm text-navy-950">
              Track: <strong>{track}</strong>{" "}
              <button
                type="button"
                onClick={() => goTo(2)}
                className="ml-1 font-semibold text-navy-700 underline underline-offset-4"
              >
                Change
              </button>
            </p>
            <Choice
              name="skillLevel"
              legend="Q1. What is your current skill level?"
              options={SKILL_LEVELS}
              value={text("skillLevel")}
              error={errors.skillLevel}
              onChange={(v) => set("skillLevel", v)}
            />

            <div>
              <TextAreaField
                name="problem"
                label="Q2. In 1 sentence, what problem do you want to solve in Nigeria?"
                required
                rows={3}
                hint="Be specific. Name the problem, who has it and where."
                value={text("problem")}
                error={errors.problem}
                {...field}
              />
              <p
                className={cn(
                  "mt-1 text-right text-xs tabular-nums",
                  problemLen > PROBLEM_MAX ? "text-red-700" : "text-muted",
                )}
                aria-live="polite"
              >
                {problemLen}/{PROBLEM_MAX} characters
              </p>
            </div>

            <div>
              <div className="mb-3 flex gap-3 rounded-xl border border-gold/40 bg-gold/[0.06] p-4 text-sm text-navy-950">
                <Video aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-gold-ink" />
                <p>
                  Record a 1-minute video on your phone:{" "}
                  <em>&ldquo;My name is ___, from ___, I should be picked because ___.&rdquo;</em> Upload it
                  to YouTube (unlisted), Google Drive, TikTok, Instagram or Loom, make it viewable, and paste
                  the link.
                </p>
              </div>
              <TextField
                name="videoUrl"
                label="Q3. Your 1-minute video link"
                required
                inputMode="url"
                hint="Applications without a video are ranked low."
                value={text("videoUrl")}
                error={errors.videoUrl}
                {...field}
              />
            </div>

            {/* Q4: track-specific */}
            <div className="rounded-2xl border border-line p-5">
              <p className="text-sm font-semibold text-navy-950">Q4. {track} track information</p>
              <div className="mt-4 space-y-5">
                {track === "Skills" && (
                  <SelectField
                    name="skill"
                    label="Which skill do you want?"
                    required
                    options={SKILLS}
                    placeholder="Select a skill"
                    value={text("skill")}
                    error={errors.skill}
                    {...field}
                  />
                )}
                {track === "Jobs" && (
                  <>
                    <div>
                      <p className="mb-2 text-sm font-semibold text-navy-950">
                        Upload your CV <span className="font-normal text-muted">(PDF, max 2 MB)</span>
                        <span className="text-gold-ink" aria-hidden="true">
                          {" "}
                          *
                        </span>
                      </p>
                      {cv ? (
                        <div className="flex items-center gap-3 rounded-xl border border-line bg-ivory px-4 py-3">
                          <FileText aria-hidden="true" className="size-5 text-gold-ink" />
                          <span className="min-w-0 flex-1 truncate text-sm text-navy-950">{cv.name}</span>
                          <span className="text-xs text-muted">{Math.ceil(cv.size / 1024)} KB</span>
                          <button
                            type="button"
                            onClick={() => {
                              set("cv", null);
                              if (fileRef.current) fileRef.current.value = "";
                            }}
                            className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-white hover:text-navy-950"
                          >
                            <X aria-hidden="true" className="size-4" />
                            <span className="sr-only">Remove CV</span>
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="f-cv"
                          className={cn(
                            "flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-sm font-semibold text-navy-950 hover:border-gold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-navy-700/30",
                            errors.cv ? "border-red-600" : "border-navy-950/25",
                          )}
                        >
                          <Upload aria-hidden="true" className="size-4 text-gold-ink" />
                          Choose a PDF
                          <input
                            ref={fileRef}
                            id="f-cv"
                            name="cv"
                            type="file"
                            accept="application/pdf,.pdf"
                            className="sr-only"
                            aria-invalid={errors.cv ? true : undefined}
                            aria-describedby={errors.cv ? "f-cv-error" : undefined}
                            onChange={(e) => onFile(e.target.files?.[0])}
                          />
                        </label>
                      )}
                      {errors.cv && (
                        <p id="f-cv-error" className="mt-1.5 text-sm font-medium text-red-700">
                          {errors.cv}
                        </p>
                      )}
                    </div>
                    <TextField
                      name="portfolioUrl"
                      label="LinkedIn or portfolio link"
                      required
                      inputMode="url"
                      value={text("portfolioUrl")}
                      error={errors.portfolioUrl}
                      {...field}
                    />
                  </>
                )}
                {track === "Capital" && (
                  <>
                    <TextField
                      name="businessName"
                      label="What is your business name?"
                      required
                      value={text("businessName")}
                      error={errors.businessName}
                      {...field}
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <SelectField
                        name="cacStatus"
                        label="Do you have CAC registration?"
                        required
                        options={CAC_STATUS}
                        placeholder="Select one"
                        value={text("cacStatus")}
                        error={errors.cacStatus}
                        {...field}
                      />
                      <SelectField
                        name="monthlyRevenue"
                        label="Monthly revenue"
                        required
                        options={MONTHLY_REVENUE}
                        placeholder="Select a range"
                        value={text("monthlyRevenue")}
                        error={errors.monthlyRevenue}
                        {...field}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <Choice
              name="available"
              legend="Q5. Can you commit 5 hours per week for 12 weeks?"
              options={YES_NO}
              columns={2}
              value={text("available")}
              error={errors.available}
              onChange={(v) => set("available", v)}
            />
            {elig.reason === "availability" && <NotEligible onBack={() => set("available", "")} />}

            <Choice
              name="priorSupport"
              legend="Q6. Have you received any grant or training before?"
              options={YES_NO}
              columns={2}
              value={text("priorSupport")}
              error={errors.priorSupport}
              onChange={(v) => set("priorSupport", v)}
            />
            {text("priorSupport") === "Yes" && (
              <TextField
                name="priorSupportFrom"
                label="From whom?"
                required
                value={text("priorSupportFrom")}
                error={errors.priorSupportFrom}
                {...field}
              />
            )}

            <Choice
              name="devices"
              legend="Q7. Laptop and internet?"
              hint="This helps us plan training centres. It does not affect selection."
              options={DEVICES}
              columns={3}
              value={text("devices")}
              error={errors.devices}
              onChange={(v) => set("devices", v)}
            />

            <div>
              <TextAreaField
                name="pitch"
                label={`Q8. Why should a CEO hire or fund YOU, in ${PITCH_MAX_WORDS} words?`}
                required
                rows={4}
                hint="We look for drive, not grammar."
                value={text("pitch")}
                error={errors.pitch}
                {...field}
              />
              <p
                className={cn(
                  "mt-1 text-right text-xs tabular-nums",
                  pitchWords > PITCH_MAX_WORDS ? "text-red-700" : "text-muted",
                )}
                aria-live="polite"
              >
                {pitchWords}/{PITCH_MAX_WORDS} words
              </p>
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-ink/80">
                <input
                  id="f-consent"
                  name="consent"
                  type="checkbox"
                  checked={values.consent === true}
                  onChange={(e) => set("consent", e.target.checked)}
                  aria-invalid={errors.consent ? true : undefined}
                  aria-describedby={errors.consent ? "f-consent-error" : undefined}
                  className="mt-0.5 size-4 shrink-0 accent-navy-950"
                />
                <span>
                  I confirm my answers are true. I consent to my application being used to assess, shortlist
                  and contact me, and shared only with partners who select me, as the{" "}
                  <Link href={PRIVACY_PATHS.privacy} className="text-navy-700 underline underline-offset-2">
                    Privacy Policy
                  </Link>{" "}
                  explains (Nigeria Data Protection Act 2023). I can withdraw my consent at any time.
                </span>
              </label>
              {errors.consent && (
                <p id="f-consent-error" className="mt-1.5 text-sm font-medium text-red-700">
                  {errors.consent}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <Honeypot value={text("website")} onChange={(v) => set("website", v)} />

      <div className="mt-10 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            className={buttonClasses("outline-dark", "lg", "w-full sm:w-auto")}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back
          </button>
        ) : (
          <p className="text-xs text-muted">Takes about 4 minutes, plus the book pre-order.</p>
        )}
        {step < STEPS.length - 1 ? (
          // Distinct keys: if React reused this element as the submit button, the
          // click that advances to the last step would also submit the form.
          <button
            key="continue"
            type="button"
            onClick={next}
            disabled={!hydrated || !elig.eligible}
            className={buttonClasses("gold", "lg", "w-full disabled:opacity-60 sm:w-auto")}
          >
            Continue
            <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        ) : (
          <button
            key="submit"
            type="submit"
            disabled={!hydrated || submitting || !elig.eligible}
            className={buttonClasses(
              "gold",
              "lg",
              "w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
            )}
          >
            {submitting ? (
              <>
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit application"
            )}
          </button>
        )}
      </div>
      <noscript>
        <p className="mt-4 text-sm text-red-800">Please enable JavaScript to complete this application.</p>
      </noscript>
    </form>
  );
}
