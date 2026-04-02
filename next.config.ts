import type { NextConfig } from "next";

const isServerOutput = process.env.NEXT_OUTPUT === "server";

const nextConfig: NextConfig = {
  // Static export for mobile bundle, server mode for Vercel API routes.
  output: isServerOutput ? undefined : "export",

  // Avoid route payload lookups under /login/__next... in static mode.
  trailingSlash: false,
  skipTrailingSlashRedirect: false,

  images: {
    // Static export mein image optimization kaam nahi karti
    unoptimized: true,
  },
};

export default nextConfig;
