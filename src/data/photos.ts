/**
 * Real photographs of the venue and its city, synced from Wikimedia Commons by
 * `npm run photos:sync` (scripts/sync-photos.mjs reads content/photos.json).
 *
 * CONTENT RULE: none of these shows the summit or its 2025 edition. "place"
 * photos show the venue and Lagos; "event" photos show people at other real
 * Nigerian conferences, and their captions name that event. Summit photos are
 * added only when the convener supplies them. Every photo renders with its
 * credit (CC BY-SA requires it): place a <PhotoCredit> next to it.
 */
import generated from "./photos.generated.json";

export type PhotoId =
  | "venue-eko-hotels"
  | "venue-eko-night"
  | "lagos-victoria-island-aerial"
  | "lagos-business-district"
  | "room-lagos-auditorium"
  | "room-edo-entrepreneurs"
  | "room-ysan-delegates"
  | "room-wcn-session"
  | "room-wcn-panel";

export type Photo = {
  id: PhotoId;
  kind: "place" | "event";
  /** The real event an "event" photo shows, as named in its caption. */
  event: string | null;
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
