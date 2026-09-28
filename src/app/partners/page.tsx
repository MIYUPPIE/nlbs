import { PageHero } from "@/components/layout/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { GoldButton } from "@/components/ui/GoldButton";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Partners",
  description:
    "Strategic, government, development, investment, technology and media partners of the Nigeria 2.0 Leadership Business Summit 2026.",
  path: "/partners",
});

export default function PartnersPage() {
  return (
    <>
      <PageHero
        eyebrow="Partners"
        title="Build Nigeria 2.0 with us."
        lead="Partners help unlock capital, talent and technology for a resilient economy. Confirmed partners will be announced here."
      >
        <GoldButton href="/contact?topic=partnership" size="lg" className="mt-10">
          Become a partner
        </GoldButton>
      </PageHero>
      <PartnersSection />
      <CTASection />
    </>
  );
}
