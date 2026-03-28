import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DayRating } from "../types";

export type { DayRating };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Central day rating logic — use this everywhere.
 * Thresholds: 100% → perfect, ≥80% → great, ≥50% → good, ≥20% → okay, else → rough
 */
export function calculateDayRating(completionPercentage: number): DayRating {
  if (completionPercentage >= 100) return "perfect";
  if (completionPercentage >= 80) return "great";
  if (completionPercentage >= 50) return "good";
  if (completionPercentage >= 20) return "okay";
  if (completionPercentage > 0) return "rough";
  return "none";
}

export function getRatingDetails(rating: DayRating) {
  switch (rating) {
    case "perfect":
      return { label: "Perfect Day", emoji: "✨", icon: "auto_awesome", colorClass: "text-white text-glow" };
    case "great":
      return { label: "Great Day", emoji: "🔥", icon: "local_fire_department", colorClass: "text-[#C4C0FF]" };
    case "good":
      return { label: "Good Day", emoji: "👍", icon: "thumb_up", colorClass: "text-[#7cf6ec]" };
    case "okay":
      return { label: "Okay Day", emoji: "🌤️", icon: "partly_cloudy_day", colorClass: "text-orange-400" };
    case "rough":
      return { label: "Rough Day", emoji: "🌧️", icon: "cloud", colorClass: "text-[#464555]" };
    default:
      return { label: "Planning Phase", emoji: "🌱", icon: "eco", colorClass: "text-[#464555]" };
  }
}

export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}
