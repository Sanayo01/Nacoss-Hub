import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import AppShell from "@/components/AppShell";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "NACOSS Hub - UNILAG Student-to-Executive Platform",
  description:
    "Official student-to-executive communication platform for NACOSS UNILAG. Direct contact, concern tracking, and announcements.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gradient-to-b from-navy-bgStart to-navy-bgEnd text-navy-heading antialiased font-sans flex flex-col selection:bg-mint selection:text-navy-onAccent">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
