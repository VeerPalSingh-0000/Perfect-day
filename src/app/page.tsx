import { LandingPageContent } from "@/components/LandingPageContent";

export const metadata = {
  title: "SIRA – Daily Routine & Aesthetic Productivity App",
  description:
    "Build unstoppable daily routines with SIRA. Track habits, rate your days, and master your productivity with beautiful stealth analytics.",
  keywords: [
    "sira",
    "habit tracker",
    "daily planner",
    "productivity app",
    "sira architect",
    "routine builder",
    "streak tracker",
    "day rating app",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SIRA – Daily Routine & Aesthetic Productivity App",
    description:
      "Build unstoppable daily routines. Track habits, rate your days, and master your time.",
    type: "website",
    url: "https://dayisperfect.netlify.app",
    locale: "en_US",
    siteName: "SIRA",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "SIRA App Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SIRA – Daily Routine & Aesthetic Productivity App",
    description:
      "Build unstoppable daily routines. Track habits, rate your days, and master your time.",
    images: ["/logo.png"],
  },
};

export default function LandingPage() {
  return <LandingPageContent />;
}