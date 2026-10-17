"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import MoreSheet from "@/components/MoreSheet";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const pathname = usePathname();
  const isExecutiveWorkspace =
    pathname.startsWith("/office") || pathname === "/admin";

  return (
    <>
      <ThemeToggle />
      {!isExecutiveWorkspace && <Navbar />}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
      {!isExecutiveWorkspace && <Footer />}
      {!isExecutiveWorkspace && (
        <BottomNav onOpenMore={() => setIsMoreOpen(true)} />
      )}
      {!isExecutiveWorkspace && (
        <MoreSheet
          isOpen={isMoreOpen}
          onClose={() => setIsMoreOpen(false)}
        />
      )}
    </>
  );
}
