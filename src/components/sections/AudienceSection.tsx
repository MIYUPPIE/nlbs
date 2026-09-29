import { audience, delegateMix, whyThisAudience } from "@/data/audience";
import { statById, formatStat } from "@/data/event";
import { HoverEffect } from "@/components/aceternity/HoverEffect";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TargetBadge } from "@/components/ui/TargetBadge";

/** `detailed` adds the delegate mix and why the audience matters (About page). */
export function AudienceSection({ detailed = false }: { detailed?: boolean }) {
  const delegates = statById("delegates");
  return (
    <Section tone="deep" labelledBy="audience-title">
      <div aria-hidden="true" className="bg-grid mask-fade-b absolute inset-0" />
      <Container className="relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="audience-title"
            tone="dark"
            eyebrow="Who Will Be in the Room"
            title="The room where Nigeria's next 12 months will be decided."
            lead="800+ invitation-only delegates. If you want to sell to, partner with or engage the people building Nigeria 2.0, this is the room."
          />
          <p className="max-w-xs text-sm text-mist lg:text-right" data-reveal>
            <span className="block font-display text-4xl text-gold">{formatStat(delegates)}</span>
            {delegates.label.toLowerCase()} from six communities.
          </p>
        </div>
        <HoverEffect
          className="-mx-1.5 mt-12"
          items={audience.map((a) => ({
            title: a.label,
            description: a.description,
            icon: a.icon,
            meta: `Est. ${a.estimate} seats`,
          }))}
        />
        <p className="mt-4 text-xs text-mist">Seat estimates are targets for the invitation list.</p>

        {detailed && (
          <div className="mt-16 grid gap-12 border-t border-white/10 pt-14 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-10 lg:col-span-7">
              <h3 className="flex items-center gap-3 text-xs font-semibold tracking-[0.22em] text-gold uppercase">
                Delegate profile <TargetBadge kind="target" />
              </h3>
              {delegateMix.map((m) => (
                <div key={m.id} data-reveal>
                  <h4 className="font-display text-2xl text-white">{m.title}</h4>
                  <ul className="mt-5 space-y-4">
                    {m.slices.map((s) => (
                      <li key={s.label}>
                        <div className="flex items-baseline justify-between gap-4 text-sm">
                          <span className="text-white/85">{s.label}</span>
                          <span className="font-semibold text-gold tabular-nums">{s.percent}%</span>
                        </div>
                        <div aria-hidden="true" className="mt-2 h-1.5 rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-gold" style={{ width: `${s.percent}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="lg:col-span-5">
              <h3 className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">
                Why this audience matters
              </h3>
              <ol className="mt-8 space-y-7">
                {whyThisAudience.map((w, i) => (
                  <li key={w.title} className="flex gap-5" data-reveal>
                    <span className="font-display text-3xl leading-none text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{w.title}</p>
                      <p className="mt-1 leading-relaxed text-mist">{w.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
