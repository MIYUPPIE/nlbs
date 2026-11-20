import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { summitCta } from "@/lib/registration-window";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden bg-navy-950 pt-28 pb-20 text-white">
      <div aria-hidden="true" className="bg-grid mask-fade-b absolute inset-0" />
      <Container className="relative">
        <p className="text-xs font-semibold tracking-[0.24em] text-gold uppercase">404</p>
        <h1 className="mt-4 font-display text-5xl sm:text-7xl">This page could not be found.</h1>
        <p className="mt-6 max-w-lg text-lg text-mist">
          The page may have moved. Head back to the summit homepage.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <GoldButton href="/">Back to home</GoldButton>
          <GoldButton href={summitCta().href} variant="outline-light" arrow={false}>
            {summitCta().shortLabel}
          </GoldButton>
        </div>
      </Container>
    </section>
  );
}
