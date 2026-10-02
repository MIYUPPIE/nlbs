import Image from "next/image";
import { event } from "@/data/event";
import { photo, type PhotoId } from "@/data/photos";
import { Container } from "@/components/ui/Container";
import { PhotoCredit } from "@/components/ui/PhotoCredit";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

/**
 * Real rooms from other Nigerian conferences, each captioned with the event it
 * shows. Deliberately not inside the 2025 edition section: none of these is a
 * summit photo (tests/photos.test.ts enforces the captions).
 */
const tiles: { id: PhotoId; className: string; sizes: string }[] = [
  {
    id: "room-lagos-auditorium",
    className: "sm:col-span-6 lg:col-span-4 lg:row-span-2 aspect-[4/3] lg:aspect-auto",
    sizes: "(min-width: 1024px) 60vw, 100vw",
  },
  {
    id: "room-wcn-panel",
    className: "sm:col-span-3 lg:col-span-2 aspect-[4/3]",
    sizes: "(min-width: 640px) 33vw, 100vw",
  },
  {
    id: "room-ysan-delegates",
    className: "sm:col-span-3 lg:col-span-2 aspect-[4/3]",
    sizes: "(min-width: 640px) 33vw, 100vw",
  },
  {
    id: "room-edo-entrepreneurs",
    className: "sm:col-span-6 lg:col-span-4 aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2/1]",
    sizes: "(min-width: 1024px) 60vw, 100vw",
  },
  {
    id: "room-wcn-session",
    className: "sm:col-span-6 lg:col-span-2 aspect-[4/3] lg:aspect-auto",
    sizes: "(min-width: 1024px) 33vw, 100vw",
  },
];

export function InTheRoomSection() {
  return (
    <Section tone="white" id="in-the-room" labelledBy="room-title">
      <Container>
        <SectionHeading
          id="room-title"
          eyebrow="In the room"
          title="This is how Nigeria convenes."
          lead={`Packed halls, working sessions and panels from conferences across the country. On ${event.date.display}, Nigeria 2.0 brings leaders, investors, businesses and talent into one room at the ${event.venue.display}.`}
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-6">
          {tiles.map(({ id, className, sizes }) => {
            const p = photo(id);
            return (
              <figure
                key={id}
                data-reveal
                className={cn("group relative overflow-hidden rounded-3xl bg-navy-950", className)}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes={sizes}
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/95 via-navy-950/70 to-transparent px-5 pt-12 pb-4">
                  <span className="block text-sm leading-snug font-medium text-white">{p.caption}</span>
                  <PhotoCredit photo={p} className="mt-1 text-white/75" />
                </figcaption>
              </figure>
            );
          })}
        </div>

        <p className="mt-6 text-sm text-muted">
          Photographs from other Nigerian conferences, each named and credited. Photos from Nigeria 2.0 itself
          will be added once published.
        </p>
      </Container>
    </Section>
  );
}
