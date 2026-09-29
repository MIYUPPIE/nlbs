import { differentiators, whyNow } from "@/data/vision";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function WhyNowSection() {
  return (
    <Section tone="white" labelledBy="why-now-title">
      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading id="why-now-title" eyebrow="Why Now" title="Why Nigeria 2.0, and why now?" />
            <ol className="mt-10 space-y-8">
              {whyNow.map((w, i) => (
                <li key={w.title} className="flex gap-5" data-reveal>
                  <span className="font-display text-3xl leading-none text-gold-ink">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-semibold text-navy-950">{w.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted">{w.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-7">
            <h2 className="text-xs font-semibold tracking-[0.22em] text-gold-ink uppercase">
              What makes us different
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {differentiators.map((d) => (
                <li
                  key={d.title}
                  data-reveal
                  className="group rounded-3xl border border-line bg-ivory p-7 transition-colors hover:border-gold/60 hover:bg-white"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-navy-950 text-gold transition-colors group-hover:bg-gold group-hover:text-navy-950">
                    <Icon name={d.icon} className="size-5" />
                  </span>
                  <h3 className="mt-6 font-display text-2xl text-navy-950">{d.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{d.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
