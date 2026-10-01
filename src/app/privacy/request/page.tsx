import Link from "next/link";
import { LEGAL, PRIVACY_PATHS } from "@/lib/privacy";
import { PageHero } from "@/components/layout/PageHero";
import { PrivacyRequestForm } from "@/components/legal/PrivacyRequestForm";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Privacy Request",
  description:
    "Ask for a copy of your data, correct it, delete it, object, withdraw consent or ask for a person to review an automated decision.",
  path: "/privacy/request",
});

export default function PrivacyRequestPage() {
  const f = LEGAL.facts;
  return (
    <>
      <PageHero
        eyebrow="Your data"
        title="Use your privacy rights."
        lead="Ask for a copy of your data, correct or delete it, object to how we use it, withdraw consent, or ask for a person to review an automated decision."
        showEvent={false}
      />
      <section aria-label="Privacy request" className="surface-light bg-ivory py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-3xl border border-line bg-white p-8 text-sm leading-relaxed text-ink">
                <h2 className="font-display text-2xl text-navy-950">How it works</h2>
                <ol className="mt-5 list-decimal space-y-3 pl-5">
                  <li>
                    Send the form, or email our Data Protection Officer at{" "}
                    <a href={`mailto:${f.dpoEmail}`} className="text-navy-700 underline underline-offset-4">
                      {f.dpoEmail}
                    </a>
                    .
                  </li>
                  <li>
                    We may ask you to confirm it is you, usually by replying from the email you used with us.
                  </li>
                  <li>We answer within {f.responseDays} days, free of charge.</li>
                </ol>
                <h3 className="mt-8 font-semibold text-navy-950">Not happy with our answer?</h3>
                <p className="mt-2">
                  You can complain to the {f.regulatorName} at{" "}
                  <a
                    href={`mailto:${f.regulatorEmail}`}
                    className="text-navy-700 underline underline-offset-4"
                  >
                    {f.regulatorEmail}
                  </a>
                  .
                </p>
                <p className="mt-6">
                  <Link href={PRIVACY_PATHS.privacy} className="text-navy-700 underline underline-offset-4">
                    Read the Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
            <div className="lg:col-span-7">
              <PrivacyRequestForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
