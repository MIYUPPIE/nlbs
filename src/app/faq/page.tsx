import { faqCategories, faqItems } from "@/data/faq";
import { PageHero } from "@/components/layout/PageHero";
import { FaqExplorer } from "@/components/faq/FaqExplorer";
import { CTASection } from "@/components/sections/CTASection";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description:
    "101 answers on the Nigeria 2.0 Leadership Business Summit: the vision, the Nigeria 2.0 Talent Fund, partnership and sponsorship, attendance and logistics, trust and governance.",
  path: "/faq",
});

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((i) => ({
    "@type": "Question",
    name: i.question,
    acceptedAnswer: { "@type": "Answer", text: i.answer },
  })),
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <PageHero
        eyebrow="FAQ"
        title="Questions, answered."
        lead={`${faqItems.length} answers on the vision, the Nigeria 2.0 Talent Fund, partnership, attendance and governance.`}
      />
      <section
        aria-label="Frequently asked questions"
        className="surface-light bg-ivory py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <FaqExplorer categories={faqCategories} />
        </Container>
      </section>
      <CTASection />
    </>
  );
}
