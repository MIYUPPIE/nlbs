import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75],
  },
  poweredByHeader: false,
  headers() {
    return [
      {
        // Unlisted partner form: kept out of search results and caches.
        source: "/sponsors",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
  redirects() {
    return [
      // Friendly aliases for the Talent Fund portal printed in the FAQ and 2.md.
      { source: "/talent/apply", destination: "/talentnigeria20", permanent: true },
      { source: "/apply", destination: "/talentnigeria20", permanent: false },
    ];
  },
};

export default nextConfig;
