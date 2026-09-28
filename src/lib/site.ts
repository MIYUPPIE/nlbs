import { event } from "@/data/event";

/**
 * Canonical origin. Set NEXT_PUBLIC_SITE_URL in the deployment environment.
 * The fallback is the domain printed on the convener's event flyer and must
 * be confirmed before launch.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nlbs.com.ng").replace(/\/$/, "");

export const siteTitle = "Nigeria 2.0 | Nigerian Leadership Business Summit 2026";

/**
 * Schema.org Event. Uses a date-only startDate/endDate because no start or
 * end time has been confirmed.
 */
export function eventJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.fullName,
    description: event.description,
    startDate: event.date.iso,
    endDate: event.date.iso,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.venue.city,
        addressCountry: "NG",
      },
    },
    organizer: {
      "@type": "Organization",
      name: event.convener,
    },
    url: siteUrl,
    image: [`${siteUrl}/opengraph-image`],
  };
}

/** JSON-LD safe serialisation (escapes `<` to block script injection). */
export const serializeJsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, "\\u003c");
