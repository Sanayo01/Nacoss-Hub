"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import MoreSheet from "@/components/MoreSheet";
import Footer from "@/components/Footer";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const pathname = usePathname();
  const isExecutiveWorkspace = pathname.startsWith("/office") || pathname === "/admin";

  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        <title>NACOS Hub - UNILAG Student-to-Executive Platform</title>
        <meta
          name="description"
          content="Official student-to-executive communication platform for NACOS UNILAG. Direct contact, concern tracking, and announcements."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-screen bg-gradient-to-b from-navy-bgStart to-navy-bgEnd text-navy-heading antialiased font-sans flex flex-col selection:bg-mint selection:text-navy-bgStart">
        {/* Sticky Header */}
        {!isExecutiveWorkspace && <Navbar />}

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
          {children}
        </main>

        {/* Campaign Footer */}
        {!isExecutiveWorkspace && <Footer />}

        {/* Mobile Bottom Navigation Bar */}
        {!isExecutiveWorkspace && <BottomNav onOpenMore={() => setIsMoreOpen(true)} />}

        {/* Mobile More Sheet Drawer */}
        {!isExecutiveWorkspace && <MoreSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />}
      </body>
    </html>
  );
}
