"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Shield, ArrowRight, Sparkles } from "lucide-react";

export default function TrackPage() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      router.push(`/track/${trackingId.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 py-8">
      {/* HEADER */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-mint/10 border border-mint/20 px-3 py-1 text-xs font-semibold text-mint">
          <Shield className="h-3.5 w-3.5" />
          Transparent Audit Timeline
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight text-navy-heading">
          Track a Concern
        </h1>
        <p className="text-xs md:text-sm text-navy-body">
          Enter your unique Tracking ID to inspect real-time progress, assigned office status updates, and public executive responses.
        </p>
      </div>

      {/* SEARCH CARD */}
      <form
        onSubmit={handleSearch}
        className="p-6 rounded-3xl border border-navy-border bg-navy-card space-y-4 shadow-xl"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-navy-heading">
            Enter Tracking ID
          </label>
          <div className="relative">
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="e.g. NH-2026-A1B2"
              className="w-full rounded-2xl border border-navy-border bg-navy-bgStart py-3.5 pl-4 pr-12 text-sm font-mono uppercase text-navy-heading placeholder:text-navy-subtle focus:border-mint focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-mint text-navy-bgStart hover:bg-mint-hover transition-colors"
              aria-label="Submit search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 text-xs font-bold text-navy-bgStart bg-mint hover:bg-mint-hover rounded-xl shadow-lg transition-all min-h-touch flex items-center justify-center gap-2"
        >
          Check Tracking Status <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {/* SAMPLE TRACKING IDS DEMO HINT */}
      <div className="p-4 rounded-2xl border border-navy-border bg-navy-card/60 text-xs text-navy-body space-y-2">
        <div className="flex items-center gap-2 text-mint font-semibold">
          <Sparkles className="h-4 w-4" /> Try one of these sample tracking IDs:
        </div>
        <div className="flex flex-wrap gap-2">
          {["NH-2026-A1B2", "NH-2026-C3D4", "NH-2026-E5F6"].map((sample) => (
            <button
              key={sample}
              onClick={() => router.push(`/track/${sample}`)}
              className="px-3 py-1.5 rounded-lg border border-navy-border bg-navy-bgStart text-navy-heading font-mono text-[11px] hover:border-mint transition-colors"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
