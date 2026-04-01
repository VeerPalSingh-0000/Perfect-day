import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Capacitor ke liye 'export' mode hamesha zaroori hai
  output: 'export',
  
  // Isse folder structure Capacitor-friendly banta hai
  trailingSlash: true,
  
  images: {
    // Static export mein image optimization kaam nahi karti
    unoptimized: true,
  },
};

export default nextConfig;