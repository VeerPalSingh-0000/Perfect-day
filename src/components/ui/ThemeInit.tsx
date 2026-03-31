"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/useThemeStore";

export default function ThemeInit() {
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
    
    // Global guard for 'releasePointerCapture' and 'setPointerCapture' errors (React 18/19 & Framer Motion bug)
    // This happens when components unmount while a pointer is still 'captured' or when IDs are lost
    if (typeof window !== 'undefined') {
        if (Element.prototype.releasePointerCapture) {
            const originalRelease = Element.prototype.releasePointerCapture;
            Element.prototype.releasePointerCapture = function(pointerId) {
                try { originalRelease.call(this, pointerId); } catch (e) {
                    // Silently swallow to prevent app crashes from library timing issues
                    console.warn('Pointer capture recovery:', e);
                }
            };
        }
        if (Element.prototype.setPointerCapture) {
            const originalSet = Element.prototype.setPointerCapture;
            Element.prototype.setPointerCapture = function(pointerId) {
                try { originalSet.call(this, pointerId); } catch (e) {
                    console.warn('Pointer capture set recovery:', e);
                }
            };
        }
    }
  }, [initTheme]);

  return null;
}
