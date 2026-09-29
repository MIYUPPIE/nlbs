import { leadership } from "@/data/vision";
import { event } from "@/data/event";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

const initials = (name: string) =>
  name
    .replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s+/, "")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

export function LeadershipSection() {
  return (
    <Section tone="light" labelledBy="leadership-title">
      <Container>
        <SectionHeading
          id="leadership-title"
          eyebrow="Leadership"
          title="Convened with purpose."
          lead={`Nigeria 2.0 is convened by ${event.convener}, a private-sector, non-partisan initiative.`}
        />
        <ul className="mt-12 grid gap-5 md:grid-cols-2">
          {leadership.map((p) => (
            <li
              key={p.name}
              data-reveal
              className="flex items-center gap-6 rounded-3xl border border-line bg-white p-7 sm:p-8"
            >
              <span
                aria-hidden="true"
                className="flex size-20 shrink-0 items-center justify-center rounded-full bg-navy-950 font-display text-3xl text-gold ring-4 ring-gold/15"
              >
                {initials(p.name)}
              </span>
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">{p.role}</p>
                <h3 className="mt-1 font-display text-3xl text-navy-950">{p.name}</h3>
                {p.credentials && <p className="mt-1 text-sm text-muted">{p.credentials}</p>}
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
