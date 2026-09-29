import { PageHero } from "@/components/layout/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { PartnershipDetailsSection } from "@/components/sections/PartnershipDetailsSection";
import { PartnershipTracksSection } from "@/components/sections/PartnershipTracksSection";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { GoldButton } from "@/components/ui/GoldButton";
import { enquiryHref } from "@/lib/enquiry";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Partners",
  description:
    "Partner with Nigeria 2.0 as a Founding Stakeholder or an Official Sponsor of the Nigerian Leadership Business Summit 2026. Limited slots on both tracks.",
  path: "/partners",
});

export default function PartnersPage() {
  return (
    <>
      <PageHero
        eyebrow="Partners"
        title="Build Nigeria 2.0 with us."
        lead="Two ways to partner: shape the policy and deal agenda as a Founding Stakeholder, or reach 800+ decision makers as an Official Sponsor. Confirmed partners will be announced here."
      >
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <GoldButton href="#tracks" size="lg">
            Compare the two tracks
          </GoldButton>
          <GoldButton href={enquiryHref("sponsor")} variant="outline-light" size="lg" arrow={false}>
            Request fees
          </GoldButton>
        </div>
      </PageHero>
      <PartnershipTracksSection />
      <PartnershipDetailsSection />
      <PartnersSection />
      <CTASection />
    </>
  );
}
