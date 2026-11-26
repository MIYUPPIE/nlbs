"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, CircleAlert, CircleCheck, CreditCard, LoaderCircle, Lock, MapPin } from "lucide-react";
import { event } from "@/data/event";
import Image from "next/image";
import { bookUrl, summitBook } from "@/data/book";
import { arrival, seatPayment, seatTotalDisplay } from "@/data/registration-plan";
import {
  fetchSeatStatus,
  normaliseReference,
  REFERENCE_PATTERN,
  requestPaymentLink,
  startSeatPayment,
  type SeatStatus,
} from "@/lib/central";
import { registrationClosure, registrationOpen } from "@/lib/registration-window";
import { usePastRegistrationDeadline } from "@/components/hooks/usePastRegistrationDeadline";
import { buttonClasses } from "@/components/ui/GoldButton";
import { useHydrated } from "@/components/hooks/useHydrated";

/** How long to wait for Paystack's confirmation after the payer comes back. */
const POLL_EVERY_MS = 3000;
const POLL_TRIES = 20;

type View =
  | { kind: "ask"; error?: string }
  | { kind: "loading" }
  | { kind: "unpaid"; seat: SeatStatus; error?: string }
  | { kind: "confirming"; seat: SeatStatus | null }
  | { kind: "slow"; seat: SeatStatus }
  | { kind: "paid"; seat: SeatStatus }
  | { kind: "error"; error: string };

/**
 * /register/pay/?ref=N2-XXXX-XXXX. Where earlier (free) registrants pay for
 * their seat, where Paystack sends payers back (it appends &reference=...),
 * and where anyone can check that their seat is confirmed. Reads only the
 * non-personal payment status (amount, seats, paid), never names or emails.
 */
export function SeatPayment() {
  const params = useSearchParams();
  const router = useRouter();
  const hydrated = useHydrated();
  const ref = normaliseReference(params.get("ref") ?? "");
  // Paystack adds ?reference= (and trxref) when it sends the payer back.
  const back = params.has("reference") || params.has("trxref");
  const [view, setView] = useState<View>(ref ? { kind: "loading" } : { kind: "ask" });
  const [paying, setPaying] = useState(false);
  const [typed, setTyped] = useState(ref);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Closed at build time, or (a build made before the deadline, served after it) by the visitor's clock.
  // After the deadline nobody can pay online; a paid delegate can still check their seat here.
  const pastDeadline = usePastRegistrationDeadline();
  const closed = !registrationOpen || pastDeadline;

  const load = useCallback(
    async (signal: { cancelled: boolean }) => {
      if (!ref) return setView({ kind: "ask" });
      if (!REFERENCE_PATTERN.test(ref)) {
        return setView({
          kind: "ask",
          error: "That does not look like a reference. It reads like N2-AB12-CD34.",
        });
      }
      setView(back ? { kind: "confirming", seat: null } : { kind: "loading" });
      for (let i = 0; i < (back ? POLL_TRIES : 1); i++) {
        const res = await fetchSeatStatus(ref);
        if (signal.cancelled) return;
        if (!res.ok) {
          return setView(
            res.notFound ? { kind: "ask", error: res.error } : { kind: "error", error: res.error },
          );
        }
        if (res.seat.paid) return setView({ kind: "paid", seat: res.seat });
        if (!back) return setView({ kind: "unpaid", seat: res.seat });
        setView({ kind: "confirming", seat: res.seat });
        await new Promise((r) => setTimeout(r, POLL_EVERY_MS));
        if (signal.cancelled) return;
      }
      const last = await fetchSeatStatus(ref);
      if (signal.cancelled) return;
      if (last.ok)
        setView(last.seat.paid ? { kind: "paid", seat: last.seat } : { kind: "slow", seat: last.seat });
      else setView({ kind: "error", error: last.error });
    },
    [ref, back],
  );

  useEffect(() => {
    const signal = { cancelled: false };
    // Fetching on mount is the point of this page (static export: no server).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    if (view.kind === "paid" || view.kind === "unpaid") headingRef.current?.focus();
  }, [view.kind]);

  const pay = async (seat: SeatStatus) => {
    setPaying(true);
    const res = await startSeatPayment(seat.reference);
    if (res.ok) {
      window.location.assign(res.checkout.url);
      return;
    }
    setPaying(false);
    if (res.paid) {
      const again = await fetchSeatStatus(seat.reference);
      if (again.ok && again.seat.paid) return setView({ kind: "paid", seat: again.seat });
    }
    setView({ kind: "unpaid", seat, error: res.error });
  };

  const lookUp = (e: React.FormEvent) => {
    e.preventDefault();
    const next = normaliseReference(typed);
    router.replace(`${seatPayment.payPath}?ref=${encodeURIComponent(next)}`);
  };

  const card = "rounded-3xl border border-line bg-white p-8 sm:p-12";

  if (view.kind === "ask") {
    return (
      <div className={card} data-pay="ask">
        <h2 className="font-display text-4xl text-navy-950">
          {closed ? "Check your seat" : "Pay for your seat"}
        </h2>
        <p className="mt-3 max-w-lg text-muted">
          {closed
            ? "Enter your registration reference to see whether your seat is paid and confirmed."
            : seatPayment.earlierRegistrants}
        </p>
        <form onSubmit={lookUp} className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row" noValidate>
          <label htmlFor="pay-ref" className="sr-only">
            Your registration reference
          </label>
          <input
            id="pay-ref"
            name="ref"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="N2-AB12-CD34"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={view.error ? true : undefined}
            aria-describedby={view.error ? "pay-ref-error" : undefined}
            className="min-h-12 flex-1 rounded-xl border border-line px-4 font-mono text-navy-950 uppercase placeholder:normal-case"
          />
          <button type="submit" disabled={!hydrated} className={buttonClasses("gold", "lg")}>
            Find my registration
          </button>
        </form>
        {view.error && (
          <p id="pay-ref-error" role="alert" className="mt-3 text-sm font-medium text-red-700">
            {view.error}
          </p>
        )}
        <ForgotReference />
        {closed ? (
          <p className="mt-8 text-sm text-muted">
            Registration closed on{" "}
            <time dateTime={registrationClosure.closedIso}>{registrationClosure.closed}</time>. You can still
            check a paid seat here.
          </p>
        ) : (
          <p className="mt-8 text-sm text-muted">
            Not registered yet?{" "}
            <Link href="/register#request" className="font-semibold text-navy-700 underline">
              Register and pay in one step
            </Link>
            .
          </p>
        )}
      </div>
    );
  }

  if (view.kind === "loading" || view.kind === "confirming") {
    return (
      <div className={card} role="status" data-pay={view.kind}>
        <LoaderCircle aria-hidden="true" className="size-8 animate-spin text-gold-ink" />
        <h2 className="mt-6 font-display text-4xl text-navy-950">
          {view.kind === "confirming" ? "Confirming your payment" : "Finding your registration"}
        </h2>
        <p className="mt-3 text-muted">
          {view.kind === "confirming"
            ? `${seatPayment.provider} is confirming your payment. This usually takes a few seconds. Please keep this page open.`
            : "One moment."}
        </p>
      </div>
    );
  }

  if (view.kind === "error") {
    return (
      <div className={card} role="alert" data-pay="error">
        <CircleAlert aria-hidden="true" className="size-8 text-red-700" />
        <h2 className="mt-6 font-display text-4xl text-navy-950">Something went wrong</h2>
        <p className="mt-3 text-muted">{view.error}</p>
        <button
          type="button"
          onClick={() => void load({ cancelled: false })}
          className={buttonClasses("gold", "lg", "mt-8")}
        >
          Try again
        </button>
      </div>
    );
  }

  if (view.kind === "paid") {
    const s = view.seat;
    return (
      <div className="rounded-3xl border border-gold/50 bg-white p-8 sm:p-12" role="status" data-pay="paid">
        <span className="flex size-16 items-center justify-center rounded-full bg-navy-950 text-gold">
          <CircleCheck aria-hidden="true" className="size-8" />
        </span>
        <h2 ref={headingRef} tabIndex={-1} className="mt-6 font-display text-4xl text-navy-950 outline-none">
          {s.seats === 1 ? "Your seat is confirmed" : `All ${s.seats} seats are confirmed`}
        </h2>
        <p className="mt-3 max-w-lg text-muted">
          Payment received. A confirmation with {s.seats === 1 ? "your seat code" : "each person's seat code"}{" "}
          is on its way by email{s.seats > 1 ? ", to you and to each guest" : ""}. Keep it: it is your proof
          of payment.
        </p>
        <SeatFacts reference={s.reference} seats={s.seats} />
        <h3 className="mt-10 text-sm font-semibold text-navy-950">What happens next</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>Bring {arrival.bring.join(" and ").toLowerCase()}.</li>
          <li>Dress code: {arrival.dressCode.toLowerCase()}.</li>
          <li>{arrival.noOnSite}</li>
        </ul>
        <p className="mt-6 text-sm text-muted">
          Can&apos;t make it? {seatPayment.refunds} Reply to your confirmation email with your seat code and
          your colleague&apos;s name and email.
        </p>
        <BookOffer />
      </div>
    );
  }

  // unpaid or slow
  const s = view.seat;
  const total = seatTotalDisplay(s.seats);
  if (closed) {
    return (
      <div className={card} data-pay="closed">
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-4xl text-navy-950 outline-none">
          This seat was not paid for
        </h2>
        <p className="mt-3 max-w-lg text-muted">
          Registration and payment closed on{" "}
          <time dateTime={registrationClosure.closedIso}>{registrationClosure.closed}</time>. Unpaid
          registrations do not hold a seat, and there is no payment at the door.
        </p>
        <SeatFacts reference={s.reference} seats={s.seats} />
      </div>
    );
  }
  return (
    <div className={card} data-pay={view.kind}>
      <h2 ref={headingRef} tabIndex={-1} className="font-display text-4xl text-navy-950 outline-none">
        {view.kind === "slow" ? "We have not received your payment yet" : "Confirm your seat"}
      </h2>
      <p className="mt-3 max-w-lg text-muted">
        {view.kind === "slow"
          ? "If you completed the payment, your confirmation email will arrive within a few minutes and this page will show it as paid. If you did not finish paying, try again below."
          : `Your registration is saved, but ${s.seats === 1 ? "your seat is" : `your ${s.seats} seats are`} not confirmed until you pay. Unpaid registrations do not hold a seat.`}
      </p>
      <SeatFacts reference={s.reference} seats={s.seats} total={total} />
      {s.seatsLeft > 0 && s.seatsLeft <= 100 && (
        <p className="mt-6 text-sm font-semibold text-gold-ink">Only {s.seatsLeft} seats left.</p>
      )}
      {"error" in view && view.error && (
        <p
          role="alert"
          className="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {view.error}
        </p>
      )}
      <button
        type="button"
        onClick={() => void pay(s)}
        disabled={paying || !hydrated}
        className={buttonClasses(
          "gold",
          "lg",
          "mt-8 w-full disabled:cursor-wait disabled:opacity-80 sm:w-auto",
        )}
      >
        {paying ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <CreditCard aria-hidden="true" className="size-4" />
        )}
        Pay {total} with {seatPayment.provider}
      </button>
      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
        <Lock aria-hidden="true" className="size-3.5" />
        {seatPayment.secure}
      </p>
      <p className="mt-2 text-xs text-muted">
        {seatPayment.refunds}{" "}
        <Link href="/terms#registration" className="underline">
          Terms
        </Link>
      </p>
    </div>
  );
}

/** Emails the payment link to the address they registered with; the page itself never says whether it exists. */
function ForgotReference() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<
    { kind: "idle" | "sending" } | { kind: "sent"; message: string } | { kind: "error"; error: string }
  >({
    kind: "idle",
  });
  const hydrated = useHydrated();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ kind: "sending" });
    const res = await requestPaymentLink(email);
    setState(res.ok ? { kind: "sent", message: res.message } : { kind: "error", error: res.error });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 text-sm font-semibold text-navy-700 underline underline-offset-4"
      >
        Forgot your reference? Email me my link
      </button>
    );
  }
  if (state.kind === "sent") {
    return (
      <p
        role="status"
        className="mt-6 max-w-md rounded-xl border border-gold/50 bg-ivory p-4 text-sm text-navy-950"
      >
        {state.message}
      </p>
    );
  }
  return (
    <form
      onSubmit={submit}
      noValidate
      className="mt-6 max-w-md rounded-2xl border border-line p-5"
      aria-labelledby="forgot-title"
    >
      <p id="forgot-title" className="font-semibold text-navy-950">
        Forgot your reference?
      </p>
      <p className="mt-1 text-sm text-muted">
        Enter the email you registered with and we will email your payment link to it.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="forgot-email" className="sr-only">
          Email you registered with
        </label>
        <input
          id="forgot-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={state.kind === "error" ? true : undefined}
          aria-describedby={state.kind === "error" ? "forgot-error" : undefined}
          className="min-h-12 flex-1 rounded-xl border border-line px-4 text-navy-950"
        />
        <button
          type="submit"
          disabled={!hydrated || state.kind === "sending"}
          className={buttonClasses("outline-dark", "lg", "disabled:cursor-wait disabled:opacity-80")}
        >
          {state.kind === "sending" ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : null}
          Email me my link
        </button>
      </div>
      {state.kind === "error" && (
        <p id="forgot-error" role="alert" className="mt-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}

/** The summit book, offered once the seat is paid: the moment a delegate is most likely to say yes. */
function BookOffer() {
  return (
    <aside
      aria-labelledby="book-offer-title"
      data-testid="book-offer"
      className="mt-10 grid gap-6 rounded-2xl bg-navy-950 p-6 text-white sm:grid-cols-[7rem_1fr] sm:items-center"
    >
      <Image
        src={summitBook.cover.src}
        width={summitBook.cover.width}
        height={summitBook.cover.height}
        alt={summitBook.coverAlt}
        className="mx-auto h-auto w-28 rounded-md shadow-lg sm:mx-0"
      />
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">Launches at the summit</p>
        <h3 id="book-offer-title" className="mt-2 font-display text-2xl leading-tight">
          {summitBook.title}
        </h3>
        <p className="mt-1 text-sm text-mist">
          by {summitBook.author}. {summitBook.pitch}
        </p>
        <p className="mt-3 text-sm text-white">
          Pre-order for <strong className="text-gold">{summitBook.priceDisplay}</strong>. Ships{" "}
          {summitBook.shipDate}.
        </p>
        <a
          href={bookUrl("seat_confirmed_page")}
          className={buttonClasses("gold", "md", "mt-5")}
          target="_blank"
          rel="noopener"
        >
          Pre-order the book
        </a>
      </div>
    </aside>
  );
}

function SeatFacts({ reference, seats, total }: { reference: string; seats: number; total?: string }) {
  return (
    <dl className="mt-8 grid max-w-md gap-3 rounded-2xl bg-ivory p-5 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="text-muted">Reference</dt>
        <dd className="font-mono font-semibold text-navy-950">{reference}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-muted">Seats</dt>
        <dd className="text-right text-navy-950">
          {seats} × {seatPayment.priceDisplay}
          {total && (
            <>
              {" "}
              = <strong>{total}</strong>
            </>
          )}
        </dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="flex items-center gap-1.5 text-muted">
          <CalendarDays aria-hidden="true" className="size-4" />
          Date
        </dt>
        <dd className="text-right text-navy-950">{event.date.display}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="flex items-center gap-1.5 text-muted">
          <MapPin aria-hidden="true" className="size-4" />
          Venue
        </dt>
        <dd className="text-right text-navy-950">{event.venue.display}</dd>
      </div>
    </dl>
  );
}
