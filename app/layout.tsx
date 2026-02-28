import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalHeader from "@/components/layout/GlobalHeader";
import { GlobalToaster } from "@/lib/utils/toast";
import { ToastProvider } from "@/components/ui/toast-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InsightX - Conversational Analytics Platform",
  description: "Transform complex data analysis into simple conversations. Upload CSV files and ask questions in plain English to get instant, data-backed insights with visualizations and statistical analysis.",
  keywords: ["analytics", "data analysis", "AI", "business intelligence", "conversational AI", "data visualization"],
  authors: [{ name: "Nabil Thange", url: "https://github.com/NabilThange" }],
  creator: "Nabil Thange",
  publisher: "InsightX",
  
  // Favicon and icons - using logo.png for better quality
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  
  // Open Graph metadata for social media
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://insightxx.vercel.app",
    siteName: "InsightX",
    title: "InsightX - Conversational Analytics Platform",
    description: "Transform complex data analysis into simple conversations. Upload CSV files and ask questions in plain English to get instant, data-backed insights with visualizations and statistical analysis.",
    images: [
      {
        url: "/home.png",
        width: 1200,
        height: 630,
        alt: "InsightX - Conversational Analytics Platform",
        type: "image/png",
      },
    ],
  },
  
  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "InsightX - Conversational Analytics Platform",
    description: "Transform complex data analysis into simple conversations. Upload CSV files and ask questions in plain English to get instant, data-backed insights with visualizations and statistical analysis.",
    images: ["/home.png"],
    creator: "@NabilThange",
  },
  
  // Additional metadata
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  robots: "index, follow",
  alternates: {
    canonical: "https://insightxx.vercel.app",
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
        {/* Favicon - explicit links to ensure proper display */}
        <link rel="icon" type="image/svg+xml" href="/logo.png" />
        <link rel="icon" type="image/png" href="/logo.png" sizes="192x192" />
        <link rel="shortcut icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme and mobile web app meta tags */}
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="InsightX" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <GlobalHeader />
          {children}
          <GlobalToaster />
        </ToastProvider>
      </body>
    </html>
  );
}
