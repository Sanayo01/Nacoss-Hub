import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-navy-border bg-navy-bgStart text-navy-body py-8 px-4 mb-16 md:mb-0">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Campaign */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-mint" />
            <span className="font-bold text-sm text-navy-heading tracking-wider uppercase">
              NACOS HUB UNILAG
            </span>
          </div>
          <p className="text-xs text-navy-body">
            Built with <Heart className="inline-block h-3 w-3 text-mint mx-0.5 fill-mint" /> by <span className="text-navy-heading font-semibold">Ayodeji</span> for NACOS UNILAG
          </p>
        </div>

        {/* Campaign Hashtags */}
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-mint/10 border border-mint/20 px-3 py-1 text-xs font-semibold text-mint">
            #AyodejiForGenSec
          </span>
          <span className="rounded-full bg-navy-card border border-navy-border px-3 py-1 text-xs font-semibold text-navy-heading">
            #KeepItRunning
          </span>
        </div>

        {/* Quick Nav links */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-navy-body">
          <Link href="/execs" className="hover:text-mint transition-colors">Execs</Link>
          <Link href="/concern" className="hover:text-mint transition-colors">Submit Concern</Link>
          <Link href="/track" className="hover:text-mint transition-colors">Track Status</Link>
          <Link href="/siwes" className="hover:text-mint transition-colors">SIWES & Alumni</Link>
          <Link href="/about" className="hover:text-mint transition-colors">Status</Link>
          <Link href="/admin" className="hover:text-mint transition-colors">Admin</Link>
        </div>
      </div>

    </footer>
  );
}
