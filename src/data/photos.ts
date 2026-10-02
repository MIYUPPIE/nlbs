/**
 * Real photographs of the venue and its city, synced from Wikimedia Commons by
 * `npm run photos:sync` (scripts/sync-photos.mjs reads content/photos.json).
 *
 * CONTENT RULE: these show the venue and Lagos, not the summit. None is from
 * the 2025 edition; real event photos are added only when the convener
 * supplies them. Every photo renders with its credit (CC BY-SA requires it),
 * which the Photo component does for you.
 */
import generated from "./photos.generated.json";

export type PhotoId =
  "venue-eko-hotels" | "venue-eko-night" | "lagos-victoria-island-aerial" | "lagos-business-district";

export type Photo = {
  id: PhotoId;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  author: string;
  authorUrl: string | null;
  licence: string;
  licenceUrl: string | null;
  sourceUrl: string;
  title: string;
};

export const photos = generated.photos as Photo[];

export function photo(id: PhotoId): Photo {
  const p = photos.find((x) => x.id === id);
  if (!p) throw new Error(`Photo "${id}" is missing: run npm run photos:sync`);
  return p;
}
