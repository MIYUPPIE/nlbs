import { PageHero } from "@/components/layout/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { SpeakersSection } from "@/components/sections/SpeakersSection";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Speakers",
  description:
    "Speakers for the Nigeria 2.0 Leadership Business Summit 2026 will be announced as they are confirmed.",
  path: "/speakers",
});

export default function SpeakersPage() {
  return (
    <>
      <PageHero
        eyebrow="Speakers"
        title="Leaders from government, business, investment and technology."
        lead="The speaker line-up will be announced as participation is confirmed."
      />
      <SpeakersSection showLink={false} />
      <section aria-labelledby="speak-title" className="surface-light border-t border-line bg-ivory py-16">
        <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="speak-title" className="font-display text-3xl text-navy-950">
              Interested in speaking?
            </h2>
            <p className="mt-2 text-muted">Share your proposed topic and background with the summit team.</p>
          </div>
          <GoldButton href="/contact?topic=speaking" variant="outline-dark">
            Submit a speaking enquiry
          </GoldButton>
        </Container>
      </section>
      <CTASection />
    </>
  );
}
