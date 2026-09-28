import { CircleCheck } from "lucide-react";
import { pitchArena } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { StartupPitchSection } from "@/components/sections/StartupPitchSection";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Startup Pitch Arena",
  description:
    "Ideas seeking capital. Solutions seeking scale. Selected startups present to investors, business leaders and ecosystem partners at Nigeria 2.0.",
  path: "/startup-pitch",
});

const tracks = [
  {
    title: "Startups",
    points: [
      "Register interest now to be notified when applications open",
      "Selection criteria will be published with the application details",
      "Selected founders pitch on the summit stage",
    ],
    href: "/contact?topic=pitch",
    cta: "Register startup interest",
  },
  {
    title: "Investors",
    points: [
      "See scalable Nigerian solutions presented live",
      "Meet founders during structured networking",
      "Register as a delegate to attend the Pitch Arena",
    ],
    href: "/register?type=Investor",
    cta: "Register as an investor",
  },
];

export default function StartupPitchPage() {
  return (
    <>
      <PageHero eyebrow="Startup Pitch Arena" title={pitchArena.subheading} lead={pitchArena.lead} />
      <StartupPitchSection cta={false} />
      <Section tone="white" labelledBy="tracks-title">
        <Container>
          <SectionHeading
            id="tracks-title"
            eyebrow={pitchArena.datesStatus}
            title="Take part in the Arena"
            lead="Application details, deadlines and the selection process will be published here when confirmed."
          />
          <ul role="list" className="mt-12 grid gap-5 md:grid-cols-2">
            {tracks.map((t) => (
              <li
                key={t.title}
                data-reveal
                className="flex flex-col rounded-3xl border border-line bg-ivory p-8 sm:p-10"
              >
                <h3 className="font-display text-3xl text-navy-950">{t.title}</h3>
                <ul className="mt-6 flex-1 space-y-3">
                  {t.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-muted">
                      <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-gold-ink" />
                      {p}
                    </li>
                  ))}
                </ul>
                <GoldButton href={t.href} className="mt-8 self-start">
                  {t.cta}
                </GoldButton>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
      <CTASection />
    </>
  );
}
