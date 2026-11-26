import Image from "next/image";
import { bookUrl, summitBook } from "@/data/book";
import { buttonClasses } from "@/components/ui/GoldButton";

/** The summit book, offered right after someone commits to the summit. Links to the book site's pre-order. */
export function BookOffer({ campaign }: { campaign: string }) {
  return (
    <aside
      aria-labelledby="book-offer-title"
      data-testid="book-offer"
      className="mt-10 grid gap-6 rounded-2xl bg-navy-950 p-6 text-left text-white sm:grid-cols-[7rem_1fr] sm:items-center"
    >
      <Image
        src={summitBook.cover.src}
        width={summitBook.cover.width}
        height={summitBook.cover.height}
        alt={summitBook.coverAlt}
        className="mx-auto h-auto w-28 rounded-md shadow-lg sm:mx-0"
      />
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">Launches at the summit</p>
        <h3 id="book-offer-title" className="mt-2 font-display text-2xl leading-tight">
          {summitBook.title}
        </h3>
        <p className="mt-1 text-sm text-mist">
          by {summitBook.author}. {summitBook.pitch}
        </p>
        <p className="mt-3 text-sm text-white">
          Pre-order for <strong className="text-gold">{summitBook.priceDisplay}</strong>. Ships{" "}
          {summitBook.shipDate}.
        </p>
        <a
          href={bookUrl(campaign)}
          className={buttonClasses("gold", "md", "mt-5")}
          target="_blank"
          rel="noopener"
        >
          Pre-order the book
        </a>
      </div>
    </aside>
  );
}
