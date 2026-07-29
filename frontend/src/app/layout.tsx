import type { Metadata, Viewport } from "next";
import { Google_Sans, Inter, JetBrains_Mono } from "next/font/google";

import { AppProviders } from "@/providers/app-provider";

import { cn } from "@/lib/utils";

import "@/styles/globals.css";
import "@/styles/include.css";

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  adjustFontFallback: false,
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Axemail | Email Sending Platform",
  description: "Internal email platform for templates, Gmail, domain and mask sending, user limits, SMTP configuration, and monthly delivery reports.",

  icons: {
    icon: "/favicons/favicon.ico",
    shortcut: "/favicons/favicon.ico",
    apple: "/favicons/apple-icon.png",
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-visual",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        googleSans.variable,
        inter.variable,
        jetBrainsMono.variable,
      )}
    >
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
