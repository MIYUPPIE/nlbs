import type { Metadata } from "next";

/** Per-page metadata with canonical, Open Graph and Twitter kept in sync. */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    // Child openGraph/twitter objects replace the parent's, so repeat the shared fields.
    openGraph: {
      type: "website",
      locale: "en_NG",
      siteName: "Nigeria 2.0",
      title: `${title} | Nigeria 2.0 Summit 2026`,
      description,
      url: path,
    },
    twitter: { card: "summary_large_image", title: `${title} | Nigeria 2.0 Summit 2026`, description },
  };
}
