import type { NextConfig } from "next";

const isServerOutput = process.env.NEXT_OUTPUT === "server";

const nextConfig: NextConfig = {
  // Static export for mobile bundle, server mode for Vercel API routes.
  output: isServerOutput ? undefined : "export",

  // Keep old trailing slash behavior for static export only.
  trailingSlash: !isServerOutput,
  skipTrailingSlashRedirect: true,

  images: {
    // Static export mein image optimization kaam nahi karti
    unoptimized: true,
  },
};

export default nextConfig;
