import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Manrope } from "next/font/google";
import "./globals.css";
import ThemeInit from "@/components/ui/ThemeInit";
import { AuthInitializer } from "@/components/AuthInitializer";

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
    default: "Perfect Day – Daily Habit Tracker & Productivity App",
    template: "%s | Perfect Day",
  },
  description:
    "Build powerful daily routines with Perfect Day. Track habits, rate your days, analyze your productivity with beautiful analytics, and build unstoppable streaks. Free and open.",
  keywords: [
    "habit tracker",
    "daily planner",
    "productivity app",
    "perfect day",
    "daily task tracker",
    "routine builder",
    "streak tracker",
    "day rating app",
    "daily routine app",
    "task management",
  ],
  authors: [{ name: "Veer Pal Singh" }],
  creator: "Veer Pal Singh",
  publisher: "Perfect Day",
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
    siteName: "Perfect Day",
    title: "Perfect Day – Daily Habit Tracker & Productivity App",
    description:
      "Build powerful daily routines. Track habits, rate your days, and build unstoppable streaks.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Perfect Day App Logo",
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
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "-eNrtVYxyV2gNmyS0SS9V7Xk5mH9F_D2_7XkY6O9O-M",
  },
  category: "productivity",
};

// Structured data for Google rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Perfect Day",
  alternateName: "Perfect Day Habit Tracker",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Android, Web",
  description:
    "A beautifully minimal daily habit tracker that helps you plan your day, track your habits, and visualize your progress with stunning analytics. Build daily routines, track streaks, and rate your days.",
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
    "Smart Task Management",
    "Habit Engine with flexible frequencies",
    "Beautiful Analytics & Heatmaps",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
        {/* Preconnect to Google Fonts CDN for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Load Material Symbols with display=swap so text renders immediately */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        {/* Preload critical images */}
        <link rel="preload" href="/logo.webp" as="image" type="image/webp" />
      </head>
      <body
        className="bg-black text-on-surface font-body min-h-screen selection:bg-white/20 overflow-x-hidden"
        suppressHydrationWarning
      >
        <ThemeInit />
        <AuthInitializer />
        {children}
      </body>
    </html>
  );
}
