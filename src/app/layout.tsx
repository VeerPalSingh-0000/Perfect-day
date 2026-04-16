import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Manrope } from "next/font/google";
import "./globals.css";
import ThemeInit from "@/components/ui/ThemeInit";
import { AuthInitializer } from "@/components/AuthInitializer";
import { InstallPWA } from "@/components/ui/InstallPWA";
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { ClientOnly } from "@/components/ClientOnly";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#f4f4f6" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://dayisperfect.netlify.app"),
  title: {
    default: "SIRA - Daily Routine and Aesthetic Productivity App",
    template: "%s | SIRA",
  },
  description:
    "Build unstoppable daily routines with SIRA. Track habits, rate your days, and analyze your productivity with a beautiful stealth interface.",
  keywords: [
    "sira",
    "habit tracker",
    "daily planner",
    "productivity app",
    "sira architect",
    "stealth task tracker",
    "routine builder",
    "streak tracker",
    "day rating app",
    "task management",
  ],
  authors: [{ name: "Veer Pal Singh" }],
  creator: "Veer Pal Singh",
  publisher: "SIRA",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dayisperfect.netlify.app",
    siteName: "SIRA",
    title: "SIRA - Daily Routine and Aesthetic Productivity App",
    description:
      "Build unstoppable daily routines. Track habits, rate your days, and master your time with SIRA.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "SIRA App Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SIRA - Daily Routine and Aesthetic Productivity App",
    description:
      "Build unstoppable daily routines. Track habits, rate your days, and master your time with SIRA.",
    images: ["/logo.png"],
  },
  verification: {
    google: "-eNrtVYxyV2gNmynl2ofvHkBfBw5BRMyxGHhGuq_0-U",
  },
  category: "productivity",
};

// Structured data for Google rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SIRA",
  alternateName: "Sira Architect",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Android, Web",
  description:
    "A sleek and minimal aesthetic habit tracker that helps you plan your day, track your routines, and visualize your progress with stunning analytics. Developed for peak performance.",
  url: "https://dayisperfect.netlify.app",
  image: "https://dayisperfect.netlify.app/logo.png",
  author: {
    "@type": "Person",
    name: "Veer Pal Singh",
    url: "https://dayisperfect.netlify.app",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "SIRA Task Management",
    "Routine Engine with flexible frequencies",
    "Stealth Analytics & Heatmaps",
    "Streak & Perfect Day Tracking",
    "Automatic Day Ratings",
    "Cloud Sync across devices",
  ],
  screenshot: "https://dayisperfect.netlify.app/logo.png",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "150",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${plusJakartaSans.variable} ${manrope.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Preconnect to Google Fonts CDN for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className="bg-black text-on-surface font-body min-h-screen selection:bg-white/20 overflow-x-hidden"
        suppressHydrationWarning
      >
        <ClientOnly>
          <ThemeInit />
          <AuthInitializer />
          <NotificationCenter />
          <InstallPWA />
        </ClientOnly>
        {children}
      </body>
    </html>
  );
}
