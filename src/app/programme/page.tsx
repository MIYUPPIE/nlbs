import { programme, programmeHeading } from "@/data/programme";
import { PageHero } from "@/components/layout/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { DealMakingSection } from "@/components/sections/DealMakingSection";
import { Container } from "@/components/ui/Container";
import { ProgrammeItem } from "@/components/ui/ProgrammeItem";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Programme",
  description:
    "Presidential keynotes, leadership panels, a strategic fireside chat, the Startup Pitch Arena, the Innovation Exhibition and a closed-door Deal Networking Dinner.",
  path: "/programme",
});

export default function ProgrammePage() {
  return (
    <>
      <PageHero
        eyebrow="Programme"
        title={programmeHeading}
        lead="Six formats built to move participants from insight to action. The running order, session times and speakers will be published as they are confirmed."
      />
      <Section labelledBy="formats-title">
        <Container size="narrow">
          <SectionHeading
            id="formats-title"
            eyebrow="Programme formats"
            title="The shape of the day"
            lead="Times are shown as they are confirmed. Until then, each format is listed with its audience."
          />
          <ol className="mt-14">
            {programme.map((item, i) => (
              <ProgrammeItem key={item.id} item={item} index={i} />
            ))}
          </ol>
        </Container>
      </Section>
      <DealMakingSection />
      <CTASection title="Be in the room." />
    </>
  );
}
