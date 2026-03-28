"use client";

import React from "react";
import Link from "next/link";
import { getCurrentYear } from "@/lib/utils";

export function StealthFooter() {
  return (
    <footer className="mt-8 sm:mt-12 flex w-full flex-col items-center gap-4 sm:gap-6 border-t border-[#464555]/10 py-8 sm:py-12 pb-24 md:pb-12">
      <div className="flex gap-4 sm:gap-8">
        <Link
          className="font-['Plus_Jakarta_Sans'] text-[8px] sm:text-[10px] font-medium uppercase tracking-[0.1rem] text-[#464555] transition-colors hover:text-[#C4C0FF]"
          href="#"
        >
          Privacy
        </Link>
        <Link
          className="font-['Plus_Jakarta_Sans'] text-[8px] sm:text-[10px] font-medium uppercase tracking-[0.1rem] text-[#464555] transition-colors hover:text-[#C4C0FF]"
          href="#"
        >
          Terms
        </Link>
        <Link
          className="font-['Plus_Jakarta_Sans'] text-[8px] sm:text-[10px] font-medium uppercase tracking-[0.1rem] text-[#464555] transition-colors hover:text-[#C4C0FF]"
          href="#"
        >
          Support
        </Link>
      </div>
      <p className="font-['Plus_Jakarta_Sans'] text-[8px] sm:text-[10px] font-medium uppercase tracking-[0.1rem] text-[#464555] text-center px-2">
        © {getCurrentYear()} STEALTH ARCHITECT. ALL RIGHTS RESERVED.
      </p>
    </footer>
  );
}
