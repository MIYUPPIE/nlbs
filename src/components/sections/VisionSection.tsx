import { bigIdea } from "@/data/vision";
import { Container } from "@/components/ui/Container";

/** "Nigeria 1.0 was built on oil" — the big idea, set as an editorial statement. */
export function VisionSection() {
  return (
    <section
      aria-labelledby="vision-title"
      className="relative overflow-hidden bg-navy-950 py-24 text-white sm:py-32"
    >
      <div aria-hidden="true" className="bg-grid mask-fade-center absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-gold/[0.06] blur-3xl"
      />
      <Container size="narrow" className="relative text-center">
        <p className="text-xs font-semibold tracking-[0.24em] text-gold uppercase" data-reveal>
          The Big Idea
        </p>
        <h2
          id="vision-title"
          className="mt-8 font-display text-4xl leading-[1.1] text-balance sm:text-6xl"
          data-reveal
        >
          <span className="block text-mist line-through decoration-gold/60 decoration-2">{bigIdea.was}</span>
          <span className="mt-3 block">
            Nigeria 2.0 will be built on <span className="text-gold">Capital, Talent and Technology.</span>
          </span>
        </h2>
        <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-pretty text-mist" data-reveal>
          {bigIdea.lead}
        </p>
        <div
          className="mx-auto mt-12 max-w-xl rounded-2xl border border-gold/30 bg-white/[0.03] px-6 py-6"
          data-reveal
        >
          <p className="text-sm text-mist">{bigIdea.context}</p>
          <p className="mt-3 font-display text-3xl text-gold-bright">{bigIdea.question}</p>
        </div>
        <p className="mx-auto mt-10 max-w-2xl leading-relaxed text-white/85" data-reveal>
          {bigIdea.convening}
        </p>
      </Container>
    </section>
  );
}
