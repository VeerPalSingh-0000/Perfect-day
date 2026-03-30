import { LandingPageContent } from "@/components/LandingPageContent";

export const metadata = {
  title: "Perfect Day – Daily Habit Tracker & Productivity App",
  description:
    "Build powerful daily routines with Perfect Day. Track habits, rate your days, analyze your productivity with beautiful analytics, and build unstoppable streaks. Free, elegant, and powerful.",
  keywords: [
    "habit tracker",
    "daily planner",
    "productivity app",
    "perfect day",
    "daily task tracker",
    "routine builder",
    "streak tracker",
    "day rating app",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Perfect Day – Daily Habit Tracker & Productivity App",
    description:
      "Build powerful daily routines. Track habits, rate your days, and build unstoppable streaks.",
    type: "website",
    url: "https://dayisperfect.netlify.app",
    locale: "en_US",
    siteName: "Perfect Day",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Perfect Day App Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Perfect Day – Daily Habit Tracker & Productivity App",
    description:
      "Build powerful daily routines. Track habits, rate your days, and build unstoppable streaks.",
    images: ["/logo.png"],
  },
};

export default function LandingPage() {
  return <LandingPageContent />;
}