import { Check, Minus } from "lucide-react";
import {
  partnershipSteps,
  sponsorBenefits,
  sponsorNotes,
  trackById,
  trackComparison,
} from "@/data/partnership";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { enquiryHref } from "@/lib/enquiry";

function Cell({ value }: { value: string | null }) {
  if (value === null)
    return (
      <>
        <Minus aria-hidden="true" className="mx-auto size-4 text-muted/60" />
        <span className="sr-only">Not included</span>
      </>
    );
  return <>{value}</>;
}

export function PartnershipDetailsSection() {
  const sponsorTiers = trackById("sponsor").tiers;
  return (
    <>
      <Section tone="white" id="compare" labelledBy="compare-title">
        <Container>
          <SectionHeading
            id="compare-title"
            eyebrow="Stakeholder or Sponsor"
            title="The difference, at a glance."
            lead="If your goal is to do business with government, DFIs and regulators, the Stakeholder track fits. If your goal is brand reach and leads, the Sponsor track fits."
          />
          <div
            role="region"
            aria-label="Stakeholder and Sponsor comparison (scrolls sideways)"
            tabIndex={0}
            className="mt-12 overflow-x-auto rounded-3xl border border-line focus-visible:outline-2 focus-visible:outline-gold-ink"
            data-reveal
          >
            <table className="w-full min-w-[36rem] text-left text-sm">
              <caption className="sr-only">Founding Stakeholder and Official Sponsor compared</caption>
              <thead className="bg-navy-950 text-white">
                <tr>
                  <th scope="col" className="p-5 font-semibold">
                    Question
                  </th>
                  <th scope="col" className="p-5 font-semibold text-gold">
                    Founding Stakeholder
                  </th>
                  <th scope="col" className="p-5 font-semibold">
                    Official Sponsor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {trackComparison.map((r) => (
                  <tr key={r.question} className="bg-white even:bg-ivory">
                    <th scope="row" className="p-5 font-medium text-navy-950">
                      {r.question}
                    </th>
                    <td className="p-5 text-ink">
                      <span className="inline-flex items-center gap-2">
                        {r.stakeholder.startsWith("Yes") && (
                          <Check aria-hidden="true" className="size-4 shrink-0 text-gold-ink" />
                        )}
                        {r.stakeholder}
                      </span>
                    </td>
                    <td className="p-5 text-muted">{r.sponsor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>

      <Section tone="light" id="sponsor-packages" labelledBy="packages-title">
        <Container>
          <SectionHeading
            id="packages-title"
            eyebrow="Official Sponsor packages"
            title="Choose your level of visibility."
            lead={sponsorNotes.included}
          />
          <div
            role="region"
            aria-label="Sponsor benefits by tier (scrolls sideways)"
            tabIndex={0}
            className="mt-12 overflow-x-auto rounded-3xl border border-line bg-white focus-visible:outline-2 focus-visible:outline-gold-ink"
            data-reveal
          >
            <table className="w-full min-w-[44rem] text-sm">
              <caption className="sr-only">Official Sponsor benefits by tier</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="p-5 text-left font-semibold text-navy-950">
                    Benefit
                  </th>
                  {sponsorTiers.map((t, i) => (
                    <th
                      key={t.id}
                      scope="col"
                      className={i === 0 ? "bg-navy-950 p-5 text-center text-gold" : "p-5 text-center"}
                    >
                      <span className="block font-display text-2xl">{t.name}</span>
                      <span className={i === 0 ? "text-xs text-mist" : "text-xs font-normal text-muted"}>
                        {t.slots} {t.slots === 1 ? "slot only" : "slots"}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              {sponsorBenefits.map((g) => (
                <tbody key={g.group}>
                  <tr>
                    <th
                      scope="colgroup"
                      colSpan={sponsorTiers.length + 1}
                      className="bg-ivory px-5 pt-5 pb-2 text-left text-xs font-semibold tracking-[0.18em] text-gold-ink uppercase"
                    >
                      {g.group}
                    </th>
                  </tr>
                  {g.rows.map((r) => (
                    <tr key={r.benefit} className="border-t border-line">
                      <th scope="row" className="p-5 text-left font-medium text-navy-950">
                        {r.benefit}
                      </th>
                      {r.values.map((v, i) => (
                        <td key={i} className="p-5 text-center text-ink">
                          <Cell value={v} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
          <ul className="mt-6 space-y-2 text-sm text-muted">
            <li>{sponsorNotes.exclusivity}</li>
            <li>{sponsorNotes.allocation} Fees are shared on request.</li>
          </ul>
        </Container>
      </Section>

      <Section tone="white" id="next-steps" labelledBy="steps-title">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
            <SectionHeading
              id="steps-title"
              eyebrow="What happens next"
              title="Three steps to your slot."
              className="lg:col-span-7"
            />
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
              <GoldButton href={enquiryHref("stakeholder")}>Stakeholder enquiry</GoldButton>
              <GoldButton href={enquiryHref("sponsor")} variant="outline-dark">
                Sponsor enquiry
              </GoldButton>
            </div>
          </div>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3">
            {partnershipSteps.map((s, i) => (
              <li key={s.title} className="bg-white p-8" data-reveal>
                <span className="font-display text-4xl text-gold-ink">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-semibold text-navy-950">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{s.detail}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>
    </>
  );
}
