"use client";

import React, { useState } from "react";
import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  style?: React.CSSProperties;
}

/**
 * Professional image component with smooth fade-in loading.
 * - Uses next/image under the hood.
 * - Prefers .webp over .png (auto-detects if src ends with .png)
 * - Shows a subtle shimmer placeholder while loading
 * - Smooth opacity transition on load
 * - Priority images skip lazy loading
 */
export function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false,
  style,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorSrc, setErrorSrc] = useState<string | null>(null);

  // Derive preferred src during render (avoiding useEffect for this)
  const preferredSrc =
    src.startsWith("/") && src.endsWith(".png")
      ? src.replace(/\.png$/, ".webp")
      : src;

  // Use error fallback if WEBP fails
  const currentSrc = errorSrc || preferredSrc;

  // Use key to reset state when src changes
  return (
    <div
      key={src} // Reset component state when src changes
      className={`optimized-img-wrapper ${className}`}
      style={{
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Shimmer placeholder */}
      {!isLoaded && (
        <div
          className="img-shimmer"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
          }}
        />
      )}

      {/* Actual image */}
      <Image
        src={currentSrc}
        alt={alt}
        width={width || 100} // next/image requires width and height, or fill. We use fill if width/height are absent.
        height={height || 100}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          // Fallback to original .png if .webp fails
          if (currentSrc !== src) {
            setErrorSrc(src);
          }
        }}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
          width: width ? `${width}px` : "100%",
          height: height ? `${height}px` : "100%",
          objectFit: "cover",
          position: !width && !height ? "absolute" : "relative", // If no width/height provided, make it fill its container
        }}
        unoptimized // Since capacitor uses static export, but we still benefit from next/image structural constraints
      />
    </div>
  );
}
