"use client";

import React, { useState } from "react";
import { getCurrentYear } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

export function StealthFooter() {
  const [modalContent, setModalContent] = useState<"privacy" | "terms" | "support" | null>(null);

  return (
    <footer className="mt-8 sm:mt-12 flex w-full flex-col items-center gap-4 sm:gap-6 border-t border-[#464555]/10 py-8 sm:py-12 pb-24 md:pb-12 text-[#E2E2E2]">
      <div className="flex gap-4 sm:gap-8 cursor-pointer">
        <button
          onClick={() => setModalContent("privacy")}
          className="font-['Plus_Jakarta_Sans'] text-[8px] sm:text-[10px] font-medium uppercase tracking-[0.1rem] text-[#464555] transition-colors hover:text-[#C4C0FF]"
        >
          Privacy
        </button>
        <button
          onClick={() => setModalContent("terms")}
          className="font-['Plus_Jakarta_Sans'] text-[8px] sm:text-[10px] font-medium uppercase tracking-[0.1rem] text-[#464555] transition-colors hover:text-[#C4C0FF]"
        >
          Terms
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            setModalContent("support");
          }}
          className="font-['Plus_Jakarta_Sans'] text-[8px] sm:text-[10px] font-medium uppercase tracking-[0.1rem] text-[#464555] transition-colors hover:text-[#C4C0FF]"
        >
          Support
        </button>
      </div>
      <p className="font-['Plus_Jakarta_Sans'] text-[8px] sm:text-[10px] font-medium uppercase tracking-[0.1rem] text-[#464555] text-center px-2">
        © {getCurrentYear()} SIRA ARCHITECT. ALL RIGHTS RESERVED.
      </p>

      <Modal
         isOpen={modalContent !== null}
         onClose={() => setModalContent(null)}
         title={
           modalContent === "privacy" ? "PRIVACY POLICY" : 
           modalContent === "terms" ? "TERMS OF SERVICE" : 
           "SYSTEM SUPPORT"
         }
      >
         <div className="space-y-6 text-[#E2E2E2]">
          <div className="flex items-center gap-4 border-b border-[#464555]/20 pb-4">
            <div className="h-12 w-12 rounded-xl bg-[#4F44E2]/10 border border-[#4F44E2]/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#4F44E2] text-2xl">
                {modalContent === "privacy" ? "policy" : 
                 modalContent === "terms" ? "gavel" : 
                 "support_agent"}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">
                {modalContent === "privacy" ? "Data Privacy" : 
                 modalContent === "terms" ? "Terms of Use" : 
                 "Support & Feedback"}
              </h3>
              <p className="text-[11px] text-[#464555] mt-1">
                {modalContent === "support" ? "Ready to assist" : `Last updated: ${getCurrentYear()}`}
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-[#888890] max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {modalContent === "privacy" ? (
               <>
                  <p>
                    Your data is strictly yours. Tasks, habits, and progress records are tied 
                    directly to your account.
                  </p>
                  <p>
                    Data is synced securely to enable cross-device functionality. We do not sell your 
                    data to third parties or run intrusive analytics.
                  </p>
               </>
            ) : modalContent === "terms" ? (
               <>
                  <p>
                    By using SIRA, you agree to use the service for its intended purpose: 
                    building habits and tracking personal tasks.
                  </p>
                  <p>
                    While we strive for perfect uptime and cross-device sync, we are not liable for 
                    any data loss. Please ensure you have a stable network connection to sync changes.
                  </p>
               </>
            ) : (
               <div className="flex flex-col items-center justify-center py-4 space-y-4">
                 <p className="text-center">
                   If you are experiencing system synchronization errors, need architectural guidance, or want to submit an anomaly report, please contact our support desk:
                 </p>
                 <button 
                    onClick={() => {
                        navigator.clipboard.writeText("sveerpal7727@gmail.com");
                        alert("Email copied to clipboard!");
                    }}
                    className="p-4 rounded-xl border border-white/10 bg-[#0A0A0A] w-full text-center group transition-colors hover:bg-white/5 active:bg-white/10 cursor-pointer"
                    title="Click to copy"
                 >
                    <p className="font-mono text-sm font-bold text-[#E2E2E2] group-hover:text-[#4F44E2] transition-colors">sveerpal7727@gmail.com</p>
                    <p className="text-[10px] text-[#464555] mt-1 font-bold tracking-widest uppercase">Tap to copy</p>
                 </button>
                 <a 
                   href="mailto:sveerpal7727@gmail.com"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#4F44E2]/20 border border-[#4F44E2]/50 px-4 py-2 text-xs font-bold text-[#C4C0FF] hover:bg-[#4F44E2]/30 transition-colors"
                 >
                   <span className="material-symbols-outlined text-[16px]">send</span>
                   Compose Message
                 </a>
               </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#464555]/20">
            <button
              onClick={() => setModalContent(null)}
              className="w-full py-3 rounded-lg bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              Acknowledge
            </button>
          </div>
        </div>
      </Modal>
    </footer>
  );
}
