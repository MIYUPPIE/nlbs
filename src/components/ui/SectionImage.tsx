import Image from "next/image";
import type { Illustration } from "@/data/illustrations";
import type { Photo } from "@/data/photos";
import { cn } from "@/lib/utils";

/**
 * A section's image: rounded frame, gold hairline, no caption. Real photos are
 * credited on /credits; AI illustrations are marked data-ai-generated and
 * disclosed there too.
 */
export function SectionImage({
  image,
  className,
  sizes = "(min-width: 1280px) 1200px, 100vw",
  position = "center",
}: {
  image: Photo | Illustration;
  className?: string;
  sizes?: string;
  /** CSS object-position, e.g. "center 30%". */
  position?: string;
}) {
  const ai = "generator" in image;
  return (
    <div
      data-reveal
      data-section-image={image.id}
      data-ai-generated={ai ? "true" : undefined}
      className={cn("relative overflow-hidden rounded-3xl bg-navy-950", className)}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        className="object-cover"
        style={{ objectPosition: position }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
      />
    </div>
  );
}
