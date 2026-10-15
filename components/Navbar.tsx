"use client";

import Link from "next/link";
import { Shield, Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-navy-border bg-navy-bgStart/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Brand Logo & Wordmark */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-mint rounded-lg p-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-mint/20 to-mint/5 border border-mint/30 shadow-sm text-mint group-hover:scale-105 transition-transform">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-navy-heading uppercase">
                NACOS <span className="text-mint">HUB</span>
              </span>
              <span className="hidden sm:inline-block rounded-full bg-mint/10 px-2 py-0.5 text-[10px] font-semibold text-mint border border-mint/20">
                UNILAG
              </span>
            </div>
            <p className="text-[11px] text-navy-body">Student-to-Executive Platform</p>
          </div>
        </Link>

        {/* Desktop Quick CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/about"
            className="px-3 py-2 text-xs font-semibold text-navy-body hover:text-navy-heading transition-colors"
          >
            Status
          </Link>
          <Link
            href="/track"
            className="px-4 py-2 text-xs font-semibold text-navy-heading hover:text-mint rounded-xl border border-navy-border bg-navy-card hover:bg-navy-cardHover transition-colors min-h-touch flex items-center"
          >
            Track a Concern
          </Link>

          <Link
            href="/concern"
            className="px-4 py-2 text-xs font-semibold text-navy-bgStart bg-mint hover:bg-mint-hover rounded-xl shadow-lg shadow-mint/10 transition-all transform hover:-translate-y-0.5 min-h-touch flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Reach an Exec
          </Link>
        </div>
      </div>
    </header>
  );
}
