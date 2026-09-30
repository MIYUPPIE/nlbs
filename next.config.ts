import type { NextConfig } from "next";

/**
 * Static export for cPanel: `npm run build` writes plain files to out/, which
 * scripts/build-cpanel.sh zips for public_html. Forms post from the browser to
 * the central backend (src/lib/central.ts). Redirects and response headers
 * live in public/.htaccess, since a static export cannot set them.
 */
const nextConfig: NextConfig = {
  output: "export",
  // /register/ -> out/register/index.html, which Apache serves directly.
  trailingSlash: true,
  images: {
    // No image server on shared hosting; images are already sized in public/.
    unoptimized: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
