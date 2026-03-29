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
    siteName: "Perfect Day",
    title: "Perfect Day – Daily Habit Tracker & Productivity App",
    description:
      "Build powerful daily routines. Track habits, rate your days, and build unstoppable streaks.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Perfect Day – Daily Habit Tracker & Productivity App",
    description:
      "Build powerful daily routines. Track habits, rate your days, and build unstoppable streaks.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  category: "productivity",
};

// Structured data for Google rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Perfect Day",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Android, Web",
  description:
    "A beautifully minimal daily habit tracker that helps you plan your day, track your habits, and visualize your progress with stunning analytics.",
  author: {
    "@type": "Person",
    name: "Veer Pal Singh",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "120",
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
