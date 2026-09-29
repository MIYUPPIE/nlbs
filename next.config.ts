import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75],
  },
  poweredByHeader: false,
  redirects() {
    return [
      // Friendly aliases for the Talent Fund portal printed in the FAQ and 2.md.
      { source: "/talent/apply", destination: "/talentnigeria20", permanent: true },
      { source: "/apply", destination: "/talentnigeria20", permanent: false },
    ];
  },
};

export default nextConfig;
