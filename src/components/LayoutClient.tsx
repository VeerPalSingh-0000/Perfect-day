"use client";

import { useState, useEffect, ReactNode } from "react";

interface LayoutClientProps {
  children: ReactNode;
}

export function LayoutClient({ children }: LayoutClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Jab tak client mount na ho, content mat dikhao (Hydration mismatch se bachne ke liye)
  // suppressHydrationWarning is handled at body level in layout.tsx
  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
