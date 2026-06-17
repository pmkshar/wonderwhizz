import type { Metadata } from "next";
import "@/lib/env-guard"; // must run before any module that touches env vars
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import NextAuthSessionProvider from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WonderWhiz — AI Tutor Bot for Kids",
  description:
    "A friendly AI tutor for Maths, Hindi, Science & Kannada. Class 1 to 10. Get 8 different explanation styles with multi-language voice-over.",
  keywords: [
    "AI tutor",
    "maths tutor",
    "hindi tutor",
    "science tutor",
    "kannada tutor",
    "kids learning",
    "class 1 to 10",
  ],
  authors: [{ name: "WonderWhiz" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
