import Image from "next/image";
import { leadership } from "@/data/vision";
import { event } from "@/data/event";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

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
        <div
          data-reveal
          className="mt-12 flex flex-col gap-5 rounded-3xl border border-line bg-white p-7 sm:flex-row sm:items-center sm:gap-8 sm:p-8"
        >
          <Image
            src="/brand/hbc-logo.png"
            alt={event.convener}
            width={200}
            height={83}
            className="h-14 w-auto self-start sm:self-center"
          />
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">Convener</p>
            <p className="mt-1 font-display text-3xl text-navy-950">{event.convener}</p>
          </div>
        </div>
        <ul className="mt-5 grid gap-5 md:grid-cols-2">
          {leadership.map((p) => (
            <li key={p.name} data-reveal className="overflow-hidden rounded-3xl border border-line bg-white">
              <Image
                src={p.photo.src}
                alt={`Portrait of ${p.name}, ${p.role}`}
                width={p.photo.width}
                height={p.photo.height}
                className="aspect-[4/5] w-full object-cover object-top"
              />
              <div className="p-7 sm:p-8">
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
