import { speakerGroups, speakersIn } from "@/data/speakers";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpeakerCard } from "@/components/ui/SpeakerCard";

/** Every speaker and guest of honour, in flyer order (Chief Host first). */
export const orderedSpeakers = () => speakerGroups.flatMap((g) => speakersIn(g.category));

export function SpeakersSection({ showLink = true }: { showLink?: boolean }) {
  const list = orderedSpeakers();
  return (
    <Section tone="white" id="speakers" labelledBy="speakers-title">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="speakers-title"
            eyebrow="Speakers & Guests of Honour"
            title="Voices Shaping Nigeria 2.0"
            lead="Leaders from government, business and enterprise. More speakers will be announced as they are confirmed."
          />
          {showLink && (
            <GoldButton href="/speakers" variant="outline-dark" className="self-start lg:self-auto">
              Speaker profiles
            </GoldButton>
          )}
        </div>
        <ul role="list" className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:mt-16 lg:grid-cols-4">
          {list.map((s) => (
            <li key={s.id}>
              <SpeakerCard speaker={s} profileHref={s.bio ? `/speakers/#profile-${s.id}` : undefined} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
