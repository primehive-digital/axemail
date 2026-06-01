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
  title: "Axemail | Trademark Campaign Tool",
  description:
    "Internal campaign operations platform for managing trademark workflows, lead pipelines, outreach systems, cases, documents, and execution tracking.",

  icons: {
    icon: "/frontend/public/favicons/favicon.ico",
    shortcut: "/frontend/public/favicons/favicon.ico",
    apple: "/frontend/public/favicons/apple-icon.png",
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
