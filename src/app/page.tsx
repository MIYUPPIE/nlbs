import { Hero } from "@/components/hero/Hero";
import { AboutSection } from "@/components/sections/AboutSection";
import { AudienceSection } from "@/components/sections/AudienceSection";
import { CTASection } from "@/components/sections/CTASection";
import { DealMakingSection } from "@/components/sections/DealMakingSection";
import { EditionSection } from "@/components/sections/EditionSection";
import { RoadmapSection } from "@/components/sections/RoadmapSection";
import { ExhibitionSection } from "@/components/sections/ExhibitionSection";
import { InvestmentSection } from "@/components/sections/InvestmentSection";
import { FaqTeaserSection } from "@/components/sections/FaqTeaserSection";
import { InTheRoomSection } from "@/components/sections/InTheRoomSection";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { PillarsSection } from "@/components/sections/PillarsSection";
import { ProgrammeSection } from "@/components/sections/ProgrammeSection";
import { SpeakersSection } from "@/components/sections/SpeakersSection";
import { StartupPitchSection } from "@/components/sections/StartupPitchSection";
import { StatisticsSection } from "@/components/sections/StatisticsSection";
import { TalentSection } from "@/components/sections/TalentSection";
import { TechnologySection } from "@/components/sections/TechnologySection";
import { JsonLd } from "@/components/seo/JsonLd";
import { eventJsonLd } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <JsonLd data={eventJsonLd()} />
      <Hero />
      <StatisticsSection />
      <AboutSection />
      <InTheRoomSection />
      <PillarsSection />
      <AudienceSection />
      <ProgrammeSection />
      <InvestmentSection />
      <TalentSection />
      <TechnologySection />
      <StartupPitchSection />
      <ExhibitionSection />
      <DealMakingSection />
      <EditionSection />
      <RoadmapSection compact />
      <SpeakersSection limit={4} />
      <PartnersSection compact />
      <FaqTeaserSection />
      <CTASection />
    </>
  );
}
