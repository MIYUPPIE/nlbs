import Link from "next/link";
import { ArrowRight, CalendarDays, CircleCheck, MapPin } from "lucide-react";
import { whatToExpect } from "@/data/content";
import { event } from "@/data/event";
import { arrival, entryRoutes, preEventTimeline, registrationModel } from "@/data/registration-plan";
import { PageHero } from "@/components/layout/PageHero";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pageMetadata } from "@/lib/metadata";
import { eventJsonLd } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Request an Invitation",
  description:
    "Request an invitation to Nigeria 2.0, the invitation-only Nigerian Leadership Business Summit 2026. Friday 27 November 2026, Eko Convention Centre, Lagos.",
  path: "/register",
});

export default async function RegisterPage(props: PageProps<"/register">) {
  const { type } = await props.searchParams;
  const initialDelegateType = Array.isArray(type) ? type[0] : type;

  return (
    <>
      <JsonLd data={eventJsonLd()} />
      <PageHero
        eyebrow="Invitation-only · 800 seats"
        title="Request your invitation"
        lead={registrationModel.lead}
      />
      <Section tone="white" labelledBy="routes-title">
        <Container>
          <SectionHeading
            id="routes-title"
            eyebrow="How delegates get in"
            title={registrationModel.heading}
          />
          <ul className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-5">
            {entryRoutes.map((r) => (
              <li key={r.category} className="flex flex-col bg-white p-6" data-reveal>
                <span className="flex size-10 items-center justify-center rounded-xl bg-navy-950 text-gold">
                  <Icon name={r.icon} className="size-5" />
                </span>
                <h3 className="mt-5 font-semibold text-navy-950">{r.category}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{r.how}</p>
                <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-gold-ink uppercase">
                  {r.approval}
                </p>
                {r.action && (
                  <Link
                    href={r.action.href}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 underline-offset-4 hover:underline"
                  >
                    {r.action.label}
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Container>
      </Section>
      <section
        id="request"
        aria-label="Invitation request form"
        className="surface-light bg-ivory py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-8">
              <RegistrationForm initialDelegateType={initialDelegateType} />
            </div>
            <aside className="lg:col-span-4" aria-labelledby="register-aside-title">
              <div className="rounded-3xl bg-navy-950 p-8 text-white lg:sticky lg:top-28">
                <h2
                  id="register-aside-title"
                  className="text-xs font-semibold tracking-[0.22em] text-gold uppercase"
                >
                  {event.edition}
                </h2>
                <p className="mt-4 font-display text-3xl leading-tight">{event.themeShort}</p>
                <ul className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm">
                  <li className="flex items-center gap-3">
                    <CalendarDays aria-hidden="true" className="size-4 text-gold" />
                    <time dateTime={event.date.iso}>{event.date.display}</time>
                  </li>
                  <li className="flex items-center gap-3">
                    <MapPin aria-hidden="true" className="size-4 text-gold" />
                    {event.venue.display}
                  </li>
                </ul>
                <h3 className="mt-8 text-sm font-semibold text-white">What to expect</h3>
                <ul className="mt-4 space-y-3 text-sm text-mist">
                  {whatToExpect.map((e) => (
                    <li key={e.title} className="flex items-start gap-3">
                      <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold" />
                      <span>
                        <span className="font-semibold text-white">{e.title}:</span> {e.detail}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-8 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-xs leading-relaxed text-mist">
                  Requests are free and involve no payment on this site. Seats are confirmed only after
                  vetting.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>
      <Section tone="deep" labelledBy="journey-title">
        <Container>
          <SectionHeading
            id="journey-title"
            tone="dark"
            eyebrow="Before and on the day"
            title="No queues. No surprises at the door."
          />
          <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <h3 className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">
                What you will receive
              </h3>
              <ol className="mt-6 divide-y divide-white/10 border-y border-white/10">
                {preEventTimeline.map((t) => (
                  <li key={t.when} className="grid gap-1 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
                    <p className="text-sm font-semibold text-gold">{t.when}</p>
                    <div>
                      <p className="text-white">{t.what}</p>
                      <p className="mt-1 text-xs text-mist">{t.channel}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="lg:col-span-5">
              <h3 className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">On arrival</h3>
              <dl className="mt-6 space-y-5 text-sm">
                <div>
                  <dt className="font-semibold text-white">Check-in</dt>
                  <dd className="mt-1 text-mist">{arrival.steps.join(" ")}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Bring</dt>
                  <dd className="mt-1 text-mist">{arrival.bring.join(" and ")}.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Dress code</dt>
                  <dd className="mt-1 text-mist">{arrival.dressCode}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Parking</dt>
                  <dd className="mt-1 text-mist">{arrival.parking}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Exhibitors</dt>
                  <dd className="mt-1 text-mist">{arrival.exhibitors}</dd>
                </div>
              </dl>
              <p className="mt-8 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-white">
                {arrival.noOnSite}
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
