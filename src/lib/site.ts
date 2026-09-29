import { event } from "@/data/event";

/**
 * Canonical origin. Set NEXT_PUBLIC_SITE_URL in the deployment environment.
 * The fallback is the domain printed on the convener's event flyer and must
 * be confirmed before launch.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nlbs.com.ng").replace(/\/$/, "");

export const siteTitle = "Nigeria 2.0 | Nigerian Leadership Business Summit 2026";

/**
 * Schema.org Event. Start time from the convener's flyer and FAQ (9:00 AM WAT).
 * No end time is published (evening programme varies), so endDate is date-only.
 */
export function eventJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.fullName,
    description: event.description,
    startDate: `${event.date.iso}T${event.date.startTime}:00+01:00`,
    endDate: event.date.iso,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.venue.address,
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
