import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Lock } from "lucide-react";
import { sponsorNotes, totalSlots, tracks } from "@/data/partnership";
import { contact, event } from "@/data/event";
import { PageHero } from "@/components/layout/PageHero";
import { SponsorForm } from "@/components/forms/SponsorForm";
import { Container } from "@/components/ui/Container";
import { sponsorAccessAllowed } from "@/lib/sponsor-access";

/**
 * Private partner booking form. Reachable only through the shared link
 * /sponsor/<SPONSOR_FORM_TOKEN>; any other token is a 404. Not in the nav,
 * sitemap or search results.
 */
export const metadata: Metadata = {
  title: "Partner Package Request",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: "no-referrer",
};

export default async function SponsorFormPage(props: PageProps<"/sponsor/[token]">) {
  await connection();
  const { token } = await props.params;
  if (!sponsorAccessAllowed(token)) notFound();

  return (
    <>
      <PageHero
        eyebrow="Private partner form"
        title="Request your partnership package"
        lead={`Choose your track and tier for ${event.shortName}, ${event.date.display}. The convener's office will book a 15-minute strategy call, then send your contract and invoice.`}
      />
      <section aria-label="Partner package form" className="surface-light bg-ivory py-12 sm:py-16 lg:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="min-w-0 lg:col-span-8">
              <SponsorForm accessToken={token} />
            </div>
            <aside className="lg:col-span-4" aria-labelledby="sponsor-aside-title">
              <div className="space-y-6 rounded-3xl bg-navy-950 p-8 text-white lg:sticky lg:top-28">
                <p className="flex items-center gap-2 text-xs text-mist">
                  <Lock aria-hidden="true" className="size-3.5 text-gold" />
                  Private link. Please do not share it.
                </p>
                <h2 id="sponsor-aside-title" className="font-display text-3xl leading-tight">
                  Limited slots
                </h2>
                <ul className="space-y-4 border-t border-white/10 pt-6 text-sm">
                  {tracks.map((t) => (
                    <li key={t.id}>
                      <p className="font-semibold text-white">
                        {t.name}: {totalSlots(t)} slots
                      </p>
                      <p className="mt-1 text-mist">
                        {t.tiers.map((x) => `${x.slots} ${x.name}`).join(" · ")}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="border-t border-white/10 pt-6 text-sm text-mist">{sponsorNotes.allocation}</p>
                {contact.phone && (
                  <p className="text-sm text-mist">
                    Questions? Call{" "}
                    <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="text-white underline">
                      {contact.phone}
                    </a>
                  </p>
                )}
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
