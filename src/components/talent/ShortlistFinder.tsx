"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  ExternalLink,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { contact } from "@/data/event";
import { shortlistPath } from "@/data/navigation";
import {
  shortlist,
  shortlistStates,
  shortlistTracks,
  trackSummary,
  whatsappGroupUrl,
  type ShortlistEntry,
  type Track,
} from "@/data/talent-shortlist";
import { useHydrated } from "@/components/hooks/useHydrated";
import {
  confirmEntry,
  displayName,
  HELP_AFTER_FAILED_ATTEMPTS,
  MAX_RESULTS,
  MIN_QUERY_LENGTH,
  searchShortlist,
  type NameMatch,
} from "@/lib/shortlist";
import { cn } from "@/lib/utils";

type Step = "search" | "confirm" | "joined";

const STEPS: { id: Step; label: string }[] = [
  { id: "search", label: "Find your name" },
  { id: "confirm", label: "Confirm your details" },
  { id: "joined", label: "Join the WhatsApp group" },
];

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.44 9.45-9.44 2.52 0 4.89.99 6.67 2.77a9.37 9.37 0 0 1 2.76 6.68c0 5.21-4.24 9.44-9.45 9.44m8.04-17.48A11.3 11.3 0 0 0 12.05.7C5.78.7.68 5.8.68 12.06c0 2 .52 3.96 1.52 5.68L.58 23.7l6.1-1.6a11.3 11.3 0 0 0 5.36 1.37h.01c6.26 0 11.36-5.1 11.36-11.36 0-3.03-1.18-5.89-3.32-8.03" />
    </svg>
  );
}

function StepRail({ step }: { step: Step }) {
  const at = STEPS.findIndex((s) => s.id === step);
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Progress">
      {STEPS.map((s, i) => (
        <li key={s.id} aria-current={i === at ? "step" : undefined} className="min-w-0">
          <span
            aria-hidden="true"
            className={cn("block h-1.5 rounded-full", i <= at ? "bg-gold" : "bg-white/15")}
          />
          <span
            className={cn(
              "mt-2 block text-[0.7rem] font-semibold tracking-[0.12em] uppercase sm:text-xs",
              i === at ? "text-gold" : i < at ? "text-white/80" : "text-white/55",
            )}
          >
            <span className="sr-only">
              Step {i + 1} of 3{i < at ? ", done" : ""}:{" "}
            </span>
            {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function ShortlistFinder() {
  const hydrated = useHydrated();
  const [step, setStep] = useState<Step>("search");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<NameMatch | null>(null);
  const [track, setTrack] = useState<Track | "">("");
  const [state, setState] = useState("");
  const [isMe, setIsMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failures, setFailures] = useState(0);
  const [confirmed, setConfirmed] = useState<ShortlistEntry | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const ids = useId();

  const result = useMemo(() => searchShortlist(shortlist, query), [query]);

  // Move focus to the new step's heading after a step change (not on first render).
  useEffect(() => {
    if (moved.current) headingRef.current?.focus();
  }, [step]);

  const go = (next: Step) => {
    moved.current = true;
    setStep(next);
  };

  const pick = (m: NameMatch) => {
    setPicked(m);
    setTrack("");
    setState("");
    setIsMe(false);
    setError(null);
    setFailures(0);
    go("confirm");
  };

  const restart = () => {
    setPicked(null);
    setConfirmed(null);
    setError(null);
    setFailures(0);
    go("search");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!picked) return;
    if (!track || !state || !isMe) {
      setError(
        !track
          ? "Choose the talent option you applied for."
          : !state
            ? "Choose your state of residence."
            : `Tick the box to confirm you are ${picked.name}.`,
      );
      return;
    }
    const match = confirmEntry(shortlist, picked.key, { track, state });
    if (!match) {
      setFailures((n) => n + 1);
      setError(
        `These details do not match the shortlist for ${picked.name}. Check the talent option and state you gave on your application, then try again.`,
      );
      return;
    }
    setConfirmed(match);
    setError(null);
    go("joined");
  };

  const helpLine = (
    <p className="text-sm text-muted">
      Think there is a mistake? Write to{" "}
      <a href={`mailto:${contact.email}`} className="font-semibold text-navy-700 underline">
        {contact.email}
      </a>
      {contact.phone && (
        <>
          {" "}
          or call{" "}
          <a
            href={`tel:${contact.phone.replace(/\s/g, "")}`}
            className="font-semibold text-navy-700 underline"
          >
            {contact.phone}
          </a>
        </>
      )}{" "}
      with your full name, talent option and state.
    </p>
  );

  return (
    <div
      id="find-your-name"
      className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_30px_80px_-40px_rgba(7,26,51,0.45)]"
    >
      <div className="bg-navy-950 px-6 py-6 text-white sm:px-10 sm:py-8">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-gold uppercase">
          <ShieldCheck aria-hidden="true" className="size-4" /> Shortlisted applicants
        </p>
        <div className="mt-5">
          <StepRail step={step} />
        </div>
      </div>

      <div className="px-6 py-8 sm:px-10 sm:py-10" aria-live="polite">
        {step === "search" && (
          <div>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-3xl text-navy-950 outline-none sm:text-4xl"
            >
              Find your name
            </h2>
            <p className="mt-2 text-muted">
              Type your name as you wrote it on your application. Any order works, for example your surname
              first.
            </p>
            <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-6">
              <label htmlFor={`${ids}-q`} className="mb-2 block text-sm font-semibold text-navy-950">
                Your full name
              </label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
                />
                <input
                  id={`${ids}-q`}
                  type="search"
                  autoComplete="name"
                  spellCheck={false}
                  value={query}
                  disabled={!hydrated}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={hydrated ? "e.g. Chidera Okonkwo" : "Loading the shortlist…"}
                  aria-describedby={`${ids}-q-status`}
                  className="block h-14 w-full rounded-2xl border border-line bg-ivory pr-4 pl-12 text-lg text-ink placeholder:text-muted/70 focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 focus:outline-none disabled:opacity-60"
                />
              </div>
            </form>

            <p id={`${ids}-q-status`} className="mt-3 text-sm text-muted" data-testid="search-status">
              {result.tooShort
                ? query.trim()
                  ? `Keep typing: at least ${MIN_QUERY_LENGTH} letters.`
                  : ""
                : result.total === 0
                  ? "No shortlisted applicant matches that name."
                  : result.total > MAX_RESULTS
                    ? `${result.total} names match. Showing the closest ${MAX_RESULTS}; add another name to narrow it down.`
                    : `${result.total} ${result.total === 1 ? "name matches" : "names match"}. Select yours.`}
            </p>

            {result.matches.length > 0 && (
              <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line">
                {result.matches.map((m) => (
                  <li key={m.key}>
                    <button
                      type="button"
                      onClick={() => pick(m)}
                      className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-ivory focus-visible:bg-ivory focus-visible:outline-none"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy-950 text-gold">
                        <UserRound aria-hidden="true" className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1 font-semibold break-words text-navy-950">{m.name}</span>
                      <span className="shrink-0 text-sm font-semibold text-gold-ink group-hover:underline">
                        This is me
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!result.tooShort && result.total === 0 && (
              <div className="mt-4 rounded-2xl bg-ivory p-5">
                <p className="text-sm text-navy-950">
                  Try your surname alone, or the spelling you used on the form. You can also{" "}
                  <a href={`${shortlistPath}/#full-list`} className="font-semibold text-navy-700 underline">
                    browse the full list by state
                  </a>
                  .
                </p>
                <div className="mt-3">{helpLine}</div>
              </div>
            )}
          </div>
        )}

        {step === "confirm" && picked && (
          <form onSubmit={submit} noValidate aria-labelledby={`${ids}-confirm-title`}>
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:underline"
            >
              <ArrowLeft aria-hidden="true" className="size-4" /> Search again
            </button>
            <h2
              id={`${ids}-confirm-title`}
              ref={headingRef}
              tabIndex={-1}
              className="mt-4 font-display text-3xl text-navy-950 outline-none sm:text-4xl"
            >
              Confirm your details
            </h2>
            <p className="mt-2 text-muted">
              Tell us the talent option and state you applied with. They must match the shortlist before the
              group link is shown.
            </p>

            <div className="mt-6 rounded-2xl border border-gold/50 bg-ivory p-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-gold-ink uppercase">Name</p>
              <p className="mt-1 text-xl font-semibold break-words text-navy-950" data-testid="confirm-name">
                {picked.name}
              </p>
            </div>

            <fieldset className="mt-6">
              <legend className="mb-3 text-sm font-semibold text-navy-950">
                Talent option <span className="text-gold-ink">*</span>
              </legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {shortlistTracks.map((t) => (
                  <label
                    key={t}
                    className={cn(
                      "flex cursor-pointer flex-col rounded-2xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-navy-700/30",
                      track === t
                        ? "border-navy-950 bg-navy-950 text-white"
                        : "border-line hover:border-navy-700",
                    )}
                  >
                    <input
                      type="radio"
                      name="track"
                      value={t}
                      checked={track === t}
                      onChange={() => {
                        setTrack(t);
                        setError(null);
                      }}
                      className="sr-only"
                    />
                    <span className="font-display text-2xl">{t}</span>
                    <span className={cn("mt-1 text-sm", track === t ? "text-mist" : "text-muted")}>
                      {trackSummary[t]}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-6">
              <label htmlFor={`${ids}-state`} className="mb-2 block text-sm font-semibold text-navy-950">
                Location (state of residence) <span className="text-gold-ink">*</span>
              </label>
              <div className="relative">
                <select
                  id={`${ids}-state`}
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setError(null);
                  }}
                  className="block h-13 w-full appearance-none rounded-xl border border-line bg-white px-4 pr-10 text-base text-ink focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 focus:outline-none"
                >
                  <option value="">Select your state</option>
                  {shortlistStates.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted"
                />
              </div>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-navy-950">
              <input
                type="checkbox"
                checked={isMe}
                onChange={(e) => {
                  setIsMe(e.target.checked);
                  setError(null);
                }}
                className="mt-0.5 size-5 shrink-0 accent-navy-950"
              />
              <span>
                I am <strong>{picked.name}</strong>, and these are the details I gave on my Talent Fund
                application.
              </span>
            </label>

            {error && (
              <div
                role="alert"
                data-testid="confirm-error"
                className="mt-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              >
                <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {failures >= HELP_AFTER_FAILED_ATTEMPTS && <div className="mt-4">{helpLine}</div>}

            <button
              type="submit"
              className="mt-8 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-gold px-7 font-semibold text-navy-950 shadow-[0_8px_30px_-12px_rgba(212,175,55,0.6)] transition-colors hover:bg-gold-bright sm:w-auto"
            >
              <ShieldCheck aria-hidden="true" className="size-5" /> Confirm my details
            </button>
          </form>
        )}

        {step === "joined" && confirmed && (
          <div>
            <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CircleCheck aria-hidden="true" className="size-7" />
            </span>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="mt-5 font-display text-3xl text-navy-950 outline-none sm:text-4xl"
            >
              Congratulations, you are on the shortlist
            </h2>
            <dl className="mt-6 grid gap-3 sm:grid-cols-3" data-testid="confirmed-details">
              {[
                ["Name", displayName(confirmed.name)],
                ["Talent option", confirmed.track],
                ["Location", confirmed.state],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-ivory p-4">
                  <dt className="text-xs font-semibold tracking-[0.16em] text-gold-ink uppercase">{k}</dt>
                  <dd className="mt-1 font-semibold break-words text-navy-950">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 rounded-3xl bg-navy-950 p-6 text-white sm:p-8">
              <h3 className="font-display text-2xl sm:text-3xl">
                Join the shortlisted applicants&apos; group
              </h3>
              <p className="mt-2 text-mist">
                Further instructions for shortlisted applicants will be shared in this WhatsApp group. Join it
                now and keep notifications on.
              </p>
              <a
                href={whatsappGroupUrl()}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="whatsapp-join"
                className="mt-6 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#25D366] px-8 text-base font-bold text-[#062b14] transition-colors hover:bg-[#3ee07b] sm:w-auto"
              >
                <WhatsAppGlyph className="size-6" />
                Join the WhatsApp group
                <ExternalLink aria-hidden="true" className="size-4" />
                <span className="sr-only">(opens WhatsApp in a new tab)</span>
              </a>
              <p className="mt-4 text-sm text-white/70">
                This link is for shortlisted applicants only. Please do not share it.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setQuery("");
                restart();
              }}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:underline"
            >
              <ArrowLeft aria-hidden="true" className="size-4" /> Not you? Start again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
