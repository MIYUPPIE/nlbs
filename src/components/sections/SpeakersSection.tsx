import { confirmedSpeakers, speakers } from "@/data/speakers";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpeakerCard } from "@/components/ui/SpeakerCard";

export function SpeakersSection({ limit, showLink = true }: { limit?: number; showLink?: boolean }) {
  // Confirmed speakers first, then placeholders to keep the grid composed.
  const ordered = [...confirmedSpeakers, ...speakers.filter((s) => !s.confirmed)];
  const list = limit ? ordered.slice(0, limit) : ordered;
  const announced = confirmedSpeakers.length > 0;

  return (
    <Section tone="white" id="speakers" labelledBy="speakers-title">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="speakers-title"
            eyebrow="Speakers"
            title="Voices Shaping Nigeria 2.0"
            lead={
              announced
                ? "Leaders from government, business, investment and technology."
                : "Speakers will be announced as they are confirmed. The line-up will draw from government, business, investment and technology."
            }
          />
          {showLink && (
            <GoldButton href="/speakers" variant="outline-dark" className="self-start lg:self-auto">
              All speakers
            </GoldButton>
          )}
        </div>
        <ul role="list" className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:mt-16 lg:grid-cols-4">
          {list.map((s) => (
            <li key={s.id}>
              <SpeakerCard speaker={s} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
