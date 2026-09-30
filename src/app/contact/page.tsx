import Image from "next/image";
import { ArrowUpRight, AtSign, Building2, Mail, MapPin, Phone } from "lucide-react";
import { contact, event } from "@/data/event";
import { PageHero } from "@/components/layout/PageHero";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Contact HBC Business Help, convener of the Nigeria 2.0 Leadership Business Summit 2026, Eko Convention Centre, Lagos.",
  path: "/contact",
});

function Placeholder({ children }: { children: React.ReactNode }) {
  return <span className="text-muted italic">{children}</span>;
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the summit team."
        lead="For partnership, exhibition, Startup Pitch Arena, media and general enquiries."
      />
      <section
        aria-label="Contact details and enquiry form"
        className="surface-light bg-ivory py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-3xl border border-line bg-white p-8">
                <span className="inline-flex rounded-md border border-line bg-white px-3 py-2">
                  <Image
                    src="/brand/hbc-logo.png"
                    alt="HBC Business Help"
                    width={200}
                    height={83}
                    className="h-8 w-auto"
                  />
                </span>
                <h2 className="mt-6 font-display text-3xl text-navy-950">{event.convener}</h2>
                <p className="mt-1 text-muted">Nigeria 2.0 Leadership Business Summit 2026</p>
                <dl className="mt-8 space-y-5 text-sm">
                  <div>
                    <dt className="flex items-center gap-3 font-semibold text-navy-950">
                      <Mail aria-hidden="true" className="size-5 shrink-0 text-gold-ink" />
                      Email
                    </dt>
                    <dd className="mt-1 pl-8">
                      {contact.email ? (
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-navy-700 underline underline-offset-4"
                        >
                          {contact.email}
                        </a>
                      ) : (
                        <Placeholder>Contact email to be published</Placeholder>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-3 font-semibold text-navy-950">
                      <Phone aria-hidden="true" className="size-5 shrink-0 text-gold-ink" />
                      Phone
                    </dt>
                    <dd className="mt-1 pl-8">
                      {contact.phone ? (
                        <a
                          href={`tel:${contact.phone.replace(/\s/g, "")}`}
                          className="text-navy-700 underline underline-offset-4"
                        >
                          {contact.phone}
                        </a>
                      ) : (
                        <Placeholder>Phone number to be published</Placeholder>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-3 font-semibold text-navy-950">
                      <AtSign aria-hidden="true" className="size-5 shrink-0 text-gold-ink" />
                      Social media
                    </dt>
                    <dd className="mt-1 pl-8">
                      {contact.socials.length > 0 ? (
                        <ul className="flex flex-wrap gap-4">
                          {contact.socials.map((s) => (
                            <li key={s.href}>
                              <a
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-navy-700 underline underline-offset-4"
                              >
                                {s.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : contact.socialHandle ? (
                        <span className="text-navy-950">{contact.socialHandle}</span>
                      ) : (
                        <Placeholder>Social channels to be published</Placeholder>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-3 font-semibold text-navy-950">
                      <MapPin aria-hidden="true" className="size-5 shrink-0 text-gold-ink" />
                      Venue
                    </dt>
                    <dd className="mt-1 pl-8 text-navy-950">
                      {event.venue.display}
                      <span className="block text-muted">{event.venue.address}</span>
                    </dd>
                  </div>
                  {contact.secretariat && (
                    <div>
                      <dt className="flex items-center gap-3 font-semibold text-navy-950">
                        <Building2 aria-hidden="true" className="size-5 shrink-0 text-gold-ink" />
                        Secretariat
                      </dt>
                      <dd className="mt-1 pl-8 text-navy-950">{contact.secretariat}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Map placeholder: no embed until an API key or approved embed is supplied. */}
              <div className="relative overflow-hidden rounded-3xl bg-navy-950 p-8 text-white">
                <div aria-hidden="true" className="bg-grid absolute inset-0" />
                <div
                  aria-hidden="true"
                  className="absolute top-1/2 left-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/20"
                />
                <div
                  aria-hidden="true"
                  className="absolute top-1/2 left-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/40"
                />
                <div className="relative flex min-h-48 flex-col items-center justify-center text-center">
                  <MapPin aria-hidden="true" className="size-8 text-gold" />
                  <p className="mt-3 font-display text-2xl">{event.venue.name}</p>
                  <p className="text-sm text-mist">
                    {event.venue.city}, {event.venue.country}
                  </p>
                  <a
                    href={event.venue.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-gold-bright"
                  >
                    Open in Google Maps
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <EnquiryForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
