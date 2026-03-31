"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAchievementStore } from "@/stores/useAchievementStore";
import { Achievement } from "@/types";

export function AchievementCelebration() {
  const { achievements, markAchievementViewed } = useAchievementStore();
  const [currentQueue, setCurrentQueue] = useState<Achievement[]>([]);
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    const unviewed = achievements.filter((a) => !a.isViewed);
    if (unviewed.length > 0 && !isShowing) {
      setCurrentQueue(unviewed);
      setIsShowing(true);
    }
  }, [achievements, isShowing]);

  const handleDismiss = () => {
    if (currentQueue.length > 0) {
      const achievement = currentQueue[0];
      markAchievementViewed(achievement.id);
      setCurrentQueue((prev) => prev.slice(1));
    }
    if (currentQueue.length <= 1) {
      setIsShowing(false);
    }
  };

  const achievement = currentQueue[0];

  return (
    <AnimatePresence>
      {isShowing && achievement && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#C4C0FF]/30 bg-[#0E0E0E] p-8 text-center shadow-[0_0_50px_rgba(196,192,255,0.2)]"
          >
            <motion.div
              initial={{ rotate: -15, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#C4C0FF]/10 text-4xl shadow-[0_0_30px_rgba(196,192,255,0.3)]"
            >
              {achievement.icon}
            </motion.div>
            
            <h3 className="font-headline text-2xl font-black tracking-tight text-white mb-2">
              ACHIEVEMENT UNLOCKED
            </h3>
            <h4 className="font-headline text-lg font-bold text-[#C4C0FF] mb-3 uppercase tracking-widest">
              {achievement.title}
            </h4>
            <p className="text-sm text-[#8E8D99] mb-8 leading-relaxed">
              {achievement.description}
            </p>

            <button
              onClick={handleDismiss}
              className="w-full rounded-full bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-[#E2E2E2] active:scale-95"
            >
              Awesome
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
