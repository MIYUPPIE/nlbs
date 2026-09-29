import { event } from "@/data/event";
import { summitExperience } from "@/data/vision";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function SummitExperienceSection() {
  return (
    <Section tone="deep" labelledBy="experience-title">
      <div aria-hidden="true" className="bg-grid mask-fade-b absolute inset-0" />
      <Container className="relative">
        <SectionHeading
          id="experience-title"
          tone="dark"
          eyebrow={`The Summit Experience · ${event.date.short}`}
          title="A working day, built for outcomes."
          lead={`${event.venue.display}. From ${event.date.startDisplay}, with 800 leaders in the room.`}
        />
        <ul className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {summitExperience.map((x, i) => (
            <li
              key={x.title}
              data-reveal
              className="group bg-navy-950 p-8 transition-colors hover:bg-navy-900"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-full border border-gold/40 text-gold transition-colors group-hover:bg-gold group-hover:text-navy-950">
                  <Icon name={x.icon} className="size-5" />
                </span>
                <span
                  aria-hidden="true"
                  data-index={String(i + 1).padStart(2, "0")}
                  className="font-display text-2xl text-white/15 before:content-[attr(data-index)]"
                />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">{x.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{x.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
