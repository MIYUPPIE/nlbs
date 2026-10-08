import "server-only";
import { LOGO_MARK } from "@/lib/logo";

/**
 * data: URI of the mark for <img> inside next/og ImageResponse (favicon,
 * Apple icon, share image). Build-time only: uses Node's Buffer, so keep it
 * out of client components (LogoMark draws the SVG inline instead).
 */
export const logoDataUri = (inner: string = LOGO_MARK, viewBox = "0 0 64 64") =>
  `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${inner}</svg>`,
  ).toString("base64")}`;
