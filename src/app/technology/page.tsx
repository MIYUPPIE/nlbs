import { PageHero } from "@/components/layout/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { ExhibitionSection } from "@/components/sections/ExhibitionSection";
import { StartupPitchSection } from "@/components/sections/StartupPitchSection";
import { TechnologySection } from "@/components/sections/TechnologySection";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Technology",
  description:
    "AI, FinTech, AgriTech, enterprise and public technology: practical adoption to improve productivity and strengthen institutions across Nigeria.",
  path: "/technology",
});

export default function TechnologyPage() {
  return (
    <>
      <PageHero
        eyebrow="Technology"
        title="Technology for a More Productive Nigeria"
        lead="Accelerating practical technology adoption across businesses, industries and public institutions."
      />
      <TechnologySection cta={false} />
      <ExhibitionSection />
      <StartupPitchSection />
      <CTASection />
    </>
  );
}
