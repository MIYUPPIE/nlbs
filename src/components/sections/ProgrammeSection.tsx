import { programme, programmeHeading } from "@/data/programme";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProgrammeTabs } from "@/components/sections/ProgrammeTabs";

export function ProgrammeSection({ showLink = true }: { showLink?: boolean }) {
  return (
    <Section id="programme" labelledBy="programme-title">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="programme-title"
            eyebrow="Programme"
            title={programmeHeading}
            lead="Six formats designed to move participants from insight to action. Session times and speakers will be published as they are confirmed."
          />
          {showLink && (
            <GoldButton href="/programme" variant="outline-dark" className="self-start lg:self-auto">
              Full programme
            </GoldButton>
          )}
        </div>
        <div className="mt-12 lg:mt-16">
          <ProgrammeTabs items={programme} />
        </div>
      </Container>
    </Section>
  );
}
