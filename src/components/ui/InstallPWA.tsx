"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Disable in native Capacitor environment
    if ((window as any).Capacitor) return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if we've already shown it this session
      const dismissed = sessionStorage.getItem("pwa-prompt-dismissed");
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("pwa-prompt-dismissed", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-150 md:left-auto md:right-6 md:bottom-6 md:w-80"
        >
          <div className="rounded-2xl border border-[#C4C0FF]/20 bg-[#0E0E0E] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#C4C0FF]/10 text-[#C4C0FF]">
                <span className="material-symbols-outlined text-2xl">install_mobile</span>
              </div>
              <div className="grow">
                <h3 className="font-headline text-sm font-bold text-white uppercase tracking-wider">
                  Install SIRA
                </h3>
                <p className="mt-1 text-xs text-[#8E8D99] leading-relaxed">
                  Add SIRA to your home screen for a faster, native-like experience.
                </p>
              </div>
              <button 
                onClick={handleDismiss}
                className="text-[#464555] hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleInstall}
                className="flex-1 rounded-lg bg-[#E2E2E2] py-2.5 text-[10px] font-black uppercase tracking-widest text-black transition-all hover:bg-white active:scale-95"
              >
                Install Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
