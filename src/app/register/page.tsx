import { CalendarDays, CircleCheck, MapPin } from "lucide-react";
import { event } from "@/data/event";
import { PageHero } from "@/components/layout/PageHero";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/metadata";
import { eventJsonLd } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Register",
  description:
    "Register for the Nigeria 2.0 Leadership Business Summit 2026, Friday 27 November 2026, Eko Convention Centre, Lagos.",
  path: "/register",
});

const expectations = [
  "Presidential keynotes and leadership panels",
  "Startup Pitch Arena and Innovation Exhibition",
  "Structured B2B and B2G deal meetings",
  "Networking with leaders across the economy",
];

export default async function RegisterPage(props: PageProps<"/register">) {
  const { type } = await props.searchParams;
  const initialDelegateType = Array.isArray(type) ? type[0] : type;

  return (
    <>
      <JsonLd data={eventJsonLd()} />
      <PageHero
        eyebrow="Registration"
        title="Register for the Summit"
        lead="Complete the form to register your interest in attending Nigeria 2.0. The summit team will confirm next steps by email."
      />
      <section aria-label="Registration form" className="surface-light bg-ivory py-16 sm:py-20 lg:py-24">
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
                  {expectations.map((e) => (
                    <li key={e} className="flex items-start gap-3">
                      <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold" />
                      {e}
                    </li>
                  ))}
                </ul>
                <p className="mt-8 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-xs leading-relaxed text-mist">
                  Registration does not involve payment on this site. Participation details will be confirmed
                  by the summit team.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
