import { event } from "@/data/event";
import { PageHero } from "@/components/layout/PageHero";
import { AboutSection } from "@/components/sections/AboutSection";
import { AudienceSection } from "@/components/sections/AudienceSection";
import { CTASection } from "@/components/sections/CTASection";
import { EditionSection } from "@/components/sections/EditionSection";
import { PillarsSection } from "@/components/sections/PillarsSection";
import { StatisticsSection } from "@/components/sections/StatisticsSection";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "About the Summit",
  description:
    "Nigeria 2.0 convenes government, business, investors, development institutions and talent to move from dialogue to deals on capital, talent and technology.",
  path: "/about",
});

const facts = [
  { label: "Theme", value: event.theme },
  { label: "Tagline", value: event.tagline },
  { label: "Date", value: event.date.display },
  { label: "Venue", value: event.venue.display },
  { label: "Convener", value: event.convener },
  { label: "Previous edition", value: `${event.previousEdition.year}: ${event.previousEdition.theme}` },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Nigeria 2.0"
        title="Nigeria's leadership and business community, focused on what comes next."
        lead={event.heroSupport}
      />
      <AboutSection />
      <Section tone="white" labelledBy="facts-title">
        <Container>
          <h2 id="facts-title" className="text-xs font-semibold tracking-[0.24em] text-gold-ink uppercase">
            Summit facts
          </h2>
          <dl className="mt-8 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="bg-white p-7" data-reveal>
                <dt className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">{f.label}</dt>
                <dd className="mt-3 text-lg leading-snug font-medium text-navy-950">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>
      <StatisticsSection />
      <PillarsSection />
      <AudienceSection />
      <EditionSection />
      <CTASection />
    </>
  );
}
