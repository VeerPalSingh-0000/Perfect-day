"use client";

import React, { useEffect, useState } from "react";

/**
 * ClientOnly wrapper — prevents React hydration mismatch (Error #418)
 * by only rendering children after the component has mounted on the client.
 * 
 * During SSR/static export, this renders nothing (or a fallback).
 * After mount in the browser/WebView, it renders the actual children.
 * This eliminates any server/client HTML mismatch.
 */
export function ClientOnly({ children, fallback }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return fallback ?? null;
  }

  return <>{children}</>;
}
