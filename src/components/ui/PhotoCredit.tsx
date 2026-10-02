import type { Photo } from "@/data/photos";
import { cn } from "@/lib/utils";

/** Attribution line for a Commons photo: author, licence and source, all linked. */
export function PhotoCredit({ photo, className }: { photo: Photo; className?: string }) {
  return (
    <p data-photo-credit={photo.id} className={cn("text-[0.7rem] leading-snug", className)}>
      Photo:{" "}
      {photo.authorUrl ? (
        <a
          href={photo.authorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline"
        >
          {photo.author}
        </a>
      ) : (
        photo.author
      )}
      ,{" "}
      {photo.licenceUrl ? (
        <a
          href={photo.licenceUrl}
          target="_blank"
          rel="noopener noreferrer license"
          className="underline-offset-2 hover:underline"
        >
          {photo.licence}
        </a>
      ) : (
        photo.licence
      )}
      , via{" "}
      <a
        href={photo.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline-offset-2 hover:underline"
      >
        Wikimedia Commons
      </a>
    </p>
  );
}
