"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Send, Bell, MoreHorizontal } from "lucide-react";

interface BottomNavProps {
  onOpenMore: () => void;
}

export default function BottomNav({ onOpenMore }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Execs", href: "/execs", icon: Users },
    { label: "Concern", href: "/concern", icon: Send, highlight: true },
    { label: "Updates", href: "/announcements", icon: Bell },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy-bgStart/95 backdrop-blur-lg border-t border-navy-border px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="flex flex-col items-center justify-center min-h-touch min-w-touch px-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mint text-navy-onAccent shadow-lg shadow-mint/20 transform active:scale-95 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-mint mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={`flex flex-col items-center justify-center min-h-touch min-w-touch px-2 transition-colors ${
                isActive ? "text-mint font-semibold" : "text-navy-body hover:text-navy-heading"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-mint" : "text-navy-body"}`} />
              <span className="text-[11px] mt-1">{item.label}</span>
            </Link>
          );
        })}

        {/* 5th Item: More Sheet Trigger */}
        <button
          onClick={onOpenMore}
          aria-label="Open More Menu"
          className="flex flex-col items-center justify-center min-h-touch min-w-touch px-2 text-navy-body hover:text-navy-heading transition-colors"
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-[11px] mt-1">More</span>
        </button>
      </div>
    </nav>
  );
}
