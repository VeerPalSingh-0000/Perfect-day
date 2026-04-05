"use client";

import React, { useState, useRef, useEffect } from "react";

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
  const [currentSrc, setCurrentSrc] = useState(() => {
    // Prefer .webp version if the source is a local .png
    if (src.startsWith("/") && src.endsWith(".png")) {
      return src.replace(/\.png$/, ".webp");
    }
    return src;
  });
  const imgRef = useRef<HTMLImageElement>(null);

  // Update src if prop changes (e.g. avatar switch)
  useEffect(() => {
    const newSrc = (src.startsWith("/") && src.endsWith(".png"))
      ? src.replace(/\.png$/, ".webp")
      : src;
    if (newSrc !== currentSrc) {
      setIsLoaded(false);
      setCurrentSrc(newSrc);
    }
  }, [src, currentSrc]);

  // Handle case where image is already cached
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [currentSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    // Fallback to original .png if .webp fails
    if (currentSrc !== src) {
      setCurrentSrc(src);
    }
  };

  return (
    <div
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
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}
