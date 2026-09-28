import { PageHero } from "@/components/layout/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { ExhibitionSection } from "@/components/sections/ExhibitionSection";
import { TechnologySection } from "@/components/sections/TechnologySection";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Innovation Exhibition",
  description:
    "Where innovation meets opportunity. Technology companies, startups and institutions showcase AI, FinTech, AgriTech, robotics, climate, creative and education technology.",
  path: "/exhibition",
});

export default function ExhibitionPage() {
  return (
    <>
      <PageHero
        eyebrow="Innovation Exhibition"
        title="Where Innovation Meets Opportunity"
        lead="Put your products, platforms and solutions in front of the leaders who can adopt, fund and scale them."
      >
        <GoldButton href="/contact?topic=exhibition" size="lg" className="mt-10">
          Exhibit at Nigeria 2.0
        </GoldButton>
      </PageHero>
      <ExhibitionSection />
      <section
        aria-labelledby="exhibit-info-title"
        className="surface-light border-t border-line bg-ivory py-16"
      >
        <Container>
          <h2 id="exhibit-info-title" className="font-display text-3xl text-navy-950">
            Exhibitor information
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Stand options, floor plan and exhibitor packages will be published once confirmed. Send an
            exhibition enquiry to be contacted first.
          </p>
        </Container>
      </section>
      <TechnologySection />
      <CTASection />
    </>
  );
}
