import type { NextConfig } from "next";

const isNetlify = process.env.NETLIFY === "true";
const isStaticExport =
  process.env.NEXT_OUTPUT !== "server" &&
  process.env.NODE_ENV === "production" &&
  !isNetlify;

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export" as const } : {}),
  // Ensure we don't use trailing slashes for Capacitor to prevent folder routing 404s
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  ...(!isStaticExport
    ? {
        headers: async () => [
          {
            source: "/(.*)",
            headers: [
              { key: "X-Content-Type-Options", value: "nosniff" },
              { key: "X-Frame-Options", value: "DENY" },
              { key: "X-XSS-Protection", value: "1; mode=block" },
              {
                key: "Referrer-Policy",
                value: "strict-origin-when-cross-origin",
              },
              {
                key: "Permissions-Policy",
                value: "camera=(), microphone=(), geolocation=()",
              },
            ],
          },
        ],
      }
    : {}),
};

export default nextConfig;
