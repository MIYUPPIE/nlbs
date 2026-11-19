import { orderedSpeakers, speakerGroups, speakersIn } from "@/data/speakers";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpeakerCard } from "@/components/ui/SpeakerCard";
import { SpeakerOrbit } from "@/components/sections/SpeakerOrbit";

/** Dark showcase: heading on the left, the speaker orbit on the right. */
export function SpeakersSection({ showLink = true }: { showLink?: boolean }) {
  const list = orderedSpeakers();
  return (
    <Section tone="deep" id="speakers" labelledBy="speakers-title">
      <div aria-hidden="true" className="bg-grid mask-fade-b absolute inset-0 opacity-60" />
      <Container className="relative grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <SectionHeading
            id="speakers-title"
            tone="dark"
            eyebrow="Speakers & Guests of Honour"
            title="Voices Shaping Nigeria 2.0"
            lead="Leaders from government, business and enterprise. More speakers will be announced as they are confirmed."
          />
          <ul role="list" className="mt-8 hidden flex-wrap gap-2 lg:flex">
            {speakerGroups.map((g) => (
              <li
                key={g.category}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-mist"
              >
                {g.heading}
                <span className="ml-1.5 font-semibold text-gold">{speakersIn(g.category).length}</span>
              </li>
            ))}
          </ul>
          {showLink && (
            <GoldButton href="/speakers" variant="outline-light" className="mt-10 hidden lg:inline-flex">
              All speakers and profiles
            </GoldButton>
          )}
        </div>
        <div className="lg:col-span-7">
          <SpeakerOrbit speakers={list} />
          {showLink && (
            <div className="mt-10 flex justify-center lg:hidden">
              <GoldButton href="/speakers" variant="outline-light">
                All speakers and profiles
              </GoldButton>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}

/** Light grid of every speaker card (on /speakers, under the orbit). */
export function SpeakerGridSection() {
  const list = orderedSpeakers();
  return (
    <Section tone="white" id="speaker-list" labelledBy="speaker-list-title">
      <Container>
        <SectionHeading id="speaker-list-title" eyebrow="Line-up" title="All speakers" />
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
