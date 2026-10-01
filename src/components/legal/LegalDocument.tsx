import Link from "next/link";
import { LEGAL, PRIVACY_PATHS, type LegalDocKey } from "@/lib/privacy";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";

const LEADS: Record<LegalDocKey, string> = {
  privacy:
    "What we collect, why, who receives it, how long we keep it, and your rights under the Nigeria Data Protection Act 2023.",
  cookies: "What this website keeps in your browser, and the outside services on its pages.",
  terms: "The terms for using this website, registering for the summit and applying to the Talent Fund.",
};

/**
 * A generated legal document (src/data/legal.json): table of contents and
 * body. The HTML is trusted build-time output of
 * central-backend/contracts/privacy/build.mjs (values escaped there).
 */
export function LegalDocument({ doc: key }: { doc: LegalDocKey }) {
  const doc = LEGAL.docs[key];
  return (
    <>
      <PageHero eyebrow="Legal" title={doc.title} lead={LEADS[key]} showEvent={false}>
        <p className="mt-6 text-sm text-mist">
          Last updated <time dateTime={LEGAL.effectiveDate}>{doc.updated}</time>
        </p>
      </PageHero>
      <section aria-label={doc.title} className="surface-light bg-ivory py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <nav aria-label="On this page" className="lg:col-span-4">
              <div className="rounded-3xl border border-line bg-white p-6 lg:sticky lg:top-28">
                <h2 className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">
                  On this page
                </h2>
                <ol className="mt-4 space-y-2 text-sm">
                  {doc.toc.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`} className="text-navy-700 hover:text-navy-950 hover:underline">
                        {t.heading}
                      </a>
                    </li>
                  ))}
                </ol>
                {key === "privacy" && (
                  <Link
                    href={PRIVACY_PATHS.request}
                    className="mt-6 inline-flex rounded-full bg-navy-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-700"
                  >
                    Make a privacy request
                  </Link>
                )}
              </div>
            </nav>
            <div
              className="legal-prose min-w-0 lg:col-span-8"
              // Trusted, generated at build time from the policy contract.
              dangerouslySetInnerHTML={{ __html: doc.html }}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
