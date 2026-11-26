import { Suspense } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { SeatPayment } from "@/components/forms/SeatPayment";
import { Container } from "@/components/ui/Container";
import { event } from "@/data/event";
import { seatPayment } from "@/data/registration-plan";
import { pageMetadata } from "@/lib/metadata";

export const metadata = {
  ...pageMetadata({
    title: "Pay for Your Seat",
    description: `Confirm your seat at Nigeria 2.0, ${event.date.display.replace(",", "")}, ${event.venue.display}: ${seatPayment.priceDisplay} per delegate, paid securely with ${seatPayment.provider}.`,
    path: seatPayment.payPath,
  }),
  // A personal page (reference in the URL): keep it out of search results.
  robots: { index: false, follow: true },
};

export default function PayForSeatPage() {
  return (
    <>
      <PageHero
        eyebrow={`${seatPayment.priceDisplay} per delegate`}
        title="Your Nigeria 2.0 seat"
        lead="Pay for a registration you have already made, or check that your seat is confirmed."
      />
      <section aria-label="Seat payment" className="surface-light bg-ivory py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            {/* useSearchParams needs a Suspense boundary in a static export. */}
            <Suspense
              fallback={
                <div className="rounded-3xl border border-line bg-white p-8 sm:p-12" data-pay="loading">
                  <p className="text-muted">Loading…</p>
                </div>
              }
            >
              <SeatPayment />
            </Suspense>
          </div>
        </Container>
      </section>
    </>
  );
}
