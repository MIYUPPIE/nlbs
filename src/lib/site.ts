import { event } from "@/data/event";
import { speakers } from "@/data/speakers";

/**
 * Canonical origin. Set NEXT_PUBLIC_SITE_URL in the deployment environment.
 * The fallback is the domain printed on the convener's event flyer and must
 * be confirmed before launch.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nlbs.com.ng").replace(/\/$/, "");

export const siteTitle = "Nigeria 2.0 | Nigerian Leadership Business Summit 2026";

/**
 * Schema.org Event. Start and end from the convener's "New date" flyer
 * (9:00 AM to 5:00 PM WAT). The summit was moved (event.reschedule), so it is
 * marked EventRescheduled with previousStartDate, as schema.org and Google's
 * event guidelines ask for a moved event (search results show the new date
 * and that it changed).
 */
export function eventJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.fullName,
    description: event.description,
    startDate: `${event.date.iso}T${event.date.startTime}:00+01:00`,
    endDate: `${event.date.iso}T${event.date.endTime}:00+01:00`,
    eventStatus: "https://schema.org/EventRescheduled",
    previousStartDate: `${event.reschedule.previousIso}T${event.date.startTime}:00+01:00`,
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
    performer: speakers.map((s) => ({
      "@type": "Person",
      name: s.name,
      ...(s.role ? { jobTitle: s.role } : {}),
      ...(s.organisation ? { affiliation: { "@type": "Organization", name: s.organisation } } : {}),
    })),
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
