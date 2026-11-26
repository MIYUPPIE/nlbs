import Link from "next/link";
import { ArrowRight, CalendarClock, CreditCard, MailCheck, Send } from "lucide-react";
import { event } from "@/data/event";
import { preEventTimeline, registrationModel, seatPayment } from "@/data/registration-plan";
import { delegateTypes } from "@/lib/registration";
import { registrationClosure as c, registrationOpen } from "@/lib/registration-window";
import { RegistrationDaysLeft } from "@/components/sections/RegistrationDaysLeft";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Delegate types offered as one-tap shortcuts; /register?type=... preselects the form. */
const quickTypes = delegateTypes.filter((t) => t !== "Other" && t !== "Media");

const qrStep = preEventTimeline.find((t) => /QR code/.test(t.what));

const steps = [
  {
    icon: Send,
    title: "Register in two minutes",
    detail: "Add colleagues to the same order if you are coming as a team.",
  },
  {
    icon: CreditCard,
    title: `Pay ${seatPayment.priceDisplay} per seat`,
    detail: `Securely with ${seatPayment.provider}. Your seat is confirmed the moment you pay.`,
  },
  {
    icon: MailCheck,
    title: "Your QR code by email",
    detail: qrStep
      ? `${qrStep.when} the summit, with the venue map.`
      : "Before the summit, with the venue map.",
  },
];

/**
 * Homepage: delegate registration, straight after the hero while it is open
 * (src/lib/registration-window.ts). Renders nothing once registration closes,
 * leaving the Talent Fund shortlist as the first section again.
 */
export function RegistrationSection() {
  if (!registrationOpen) return null;
  return (
    <Section tone="white" id="register" labelledBy="register-title" className="scroll-mt-20">
      <Container size="wide">
        <div
          data-registration="open"
          className="relative overflow-hidden rounded-[2rem] bg-navy-950 p-7 text-white sm:p-10 lg:p-14"
        >
          <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-40" />
          <div
            aria-hidden="true"
            className="absolute -top-32 -right-32 size-96 rounded-full bg-gold/15 blur-3xl"
          />
          <div className="relative grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="min-w-0 lg:col-span-7">
              <p className="inline-flex items-center gap-2.5 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 text-[0.7rem] font-semibold tracking-[0.22em] text-gold uppercase">
                <span aria-hidden="true" className="size-1.5 animate-pulse-dot rounded-full bg-gold" />
                Delegate registration is open
              </p>
              <SectionHeading
                id="register-title"
                tone="dark"
                className="mt-6"
                title={
                  <>
                    Secure your <span className="text-gold">seat</span>
                  </>
                }
                lead={`${registrationModel.lead} ${event.date.display}, ${event.venue.display}.`}
              />

              <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-gold/40 bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-3 text-sm">
                  <CalendarClock aria-hidden="true" className="size-5 shrink-0 text-gold" />
                  <span className="text-white">
                    Open until{" "}
                    <time dateTime={c.lastDayIso} className="font-semibold">
                      {c.lastDay}
                    </time>
                    <span className="text-mist">, three days before the summit</span>
                  </span>
                </p>
                <RegistrationDaysLeft className="shrink-0 text-sm font-semibold text-gold empty:hidden" />
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <GoldButton href="/register#request" size="lg">
                  Register · {seatPayment.priceDisplay}
                </GoldButton>
                <GoldButton href={seatPayment.payPath} variant="outline-light" size="lg" arrow={false}>
                  Already registered? Pay here
                </GoldButton>
              </div>
            </div>

            <div className="min-w-0 lg:col-span-5">
              <h3 className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">How it works</h3>
              <ol className="mt-5 space-y-4">
                {steps.map((s, i) => (
                  <li key={s.title} className="flex gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold text-navy-950">
                      <s.icon aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-white">
                        <span className="sr-only">Step {i + 1}: </span>
                        {s.title}
                      </p>
                      <p className="mt-0.5 text-sm text-mist">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <h3 className="mt-10 text-xs font-semibold tracking-[0.22em] text-gold uppercase">
                Register as
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {quickTypes.map((t) => (
                  <li key={t}>
                    <Link
                      href={`/register?type=${encodeURIComponent(t)}#request`}
                      className="group inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:border-gold hover:text-gold focus-visible:border-gold focus-visible:text-gold"
                    >
                      {t}
                      <ArrowRight
                        aria-hidden="true"
                        className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
