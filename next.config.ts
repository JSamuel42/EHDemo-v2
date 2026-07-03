import type { NextConfig } from "next";
import path from "path";

// Legacy top-level module routes now live under /p/alnyx/<slug>. Redirect the
// old deep links (query strings — e.g. /library?article=… citation links — are
// preserved automatically) so nothing that previously worked 404s.
const LEGACY_MODULE_SLUGS = [
  "library",
  "document-hub",
  "projects",
  "scientific-narrative",
  "payer-value-story",
  "objection-handling",
  "ask-gvd",
  "comparative-data",
  "epidemiology",
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...LEGACY_MODULE_SLUGS.map(slug => ({
        source: `/${slug}`,
        destination: `/p/alnyx/${slug}`,
        permanent: false,
      })),
      ...LEGACY_MODULE_SLUGS.map(slug => ({
        source: `/${slug}/:path*`,
        destination: `/p/alnyx/${slug}/:path*`,
        permanent: false,
      })),
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };
    return config;
  },
};

export default nextConfig;
