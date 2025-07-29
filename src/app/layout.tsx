import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gym Training Log",
  description: "Track your gym workouts by muscle groups",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: [
    "gym",
    "workout",
    "training",
    "fitness",
    "muscle groups",
    "exercise log",
    "pwa",
  ],
  authors: [
    { name: "Gym Training Log" },
  ],
  creator: "Gym Training Log",
  publisher: "Gym Training Log",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://gympoint-nextjs.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Gym Training Log",
    description: "Track your gym workouts by muscle groups",
    url: "https://gympoint-nextjs.vercel.app",
    siteName: "Gym Training Log",
    images: "/icon-512x512.png",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Gym Training Log",
    description: "Track your gym workouts by muscle groups",
    creator: "@gymtraininglog",
    images: "/icon-512x512.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gym Training Log",
    // startUpImage: [],
  },
  verification: {
    google: "google",
    yandex: "yandex",
    yahoo: "yahoo",
    other: {
      me: ["my-email", "my-link"],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Gym Training Log" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GymLog" />
        <meta name="description" content="Track your gym workouts by muscle groups" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3b82f6" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-180x180.png" />

        {/* Standard Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icon-512x512.png" color="#3b82f6" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Apple Splash Screens */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Disable pinch zoom */}
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover" />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
