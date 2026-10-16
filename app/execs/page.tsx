"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Mail,
  Copy,
  Check,
  Send,
  UserCheck,
  X,
  Sparkles,
  ChevronRight,
  Shield,
} from "lucide-react";

interface Executive {
  id: string;
  name: string;
  position: string;
  officeSlug: string;
  photoUrl: string | null;
  bio: string;
  goToThemFor: string;
  officeEmail: string;
  isActive: boolean;
}

export default function ExecsPage() {
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExec, setSelectedExec] = useState<Executive | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExecs() {
      try {
        const res = await fetch("/api/executives");
        const json = await res.json();
        if (json.success) {
          setExecutives(json.data);
        }
      } catch (err) {
        console.error("Failed to load execs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExecs();
  }, []);

  const filteredExecs = executives.filter((exec) => {
    const q = searchQuery.toLowerCase();
    return (
      exec.name.toLowerCase().includes(q) ||
      exec.position.toLowerCase().includes(q) ||
      exec.goToThemFor.toLowerCase().includes(q) ||
      exec.officeSlug.toLowerCase().includes(q)
    );
  });

  const handleCopyEmail = (e: React.MouseEvent, email: string, slug: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`;
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8 pb-8">
      {/* HEADER */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-mint/10 border border-mint/20 px-3 py-1 text-xs font-semibold text-mint">
          <UserCheck className="h-3.5 w-3.5" />
          NACOSS UNILAG Executive Council 2025/2026
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight text-navy-heading">
          Executive Directory
        </h1>
        <p className="text-sm text-navy-body max-w-2xl">
          Direct lines to every departmental executive. Select any office to see responsibilities or submit a routed concern.
        </p>
      </div>

      {/* PROMINENT ROUTING BANNER */}
      <div className="rounded-2xl border border-mint/30 bg-gradient-to-r from-mint/15 via-navy-card to-navy-card p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-mint" />
            <h3 className="font-bold text-base text-navy-heading">Not sure who to talk to?</h3>
          </div>
          <p className="text-xs text-navy-body">
            Describe your issue and our automatic office router will direct it to the right executive immediately.
          </p>
        </div>
        <Link
          href="/concern"
          className="px-5 py-3 text-xs font-bold text-navy-onAccent bg-mint hover:bg-mint-hover rounded-xl shadow-md min-h-touch flex items-center justify-center gap-2 shrink-0 transition-transform active:scale-95"
        >
          <Send className="h-4 w-4" />
          Auto-Route My Concern
        </Link>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-subtle" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by executive name, position, or duty (e.g., 'Welfare', 'Dues', 'Tutorials')..."
          className="w-full rounded-2xl border border-navy-border bg-navy-card py-3.5 pl-10 pr-4 text-xs md:text-sm text-navy-heading placeholder:text-navy-subtle focus:border-mint focus:outline-none transition-colors"
        />
      </div>

      {/* EXECS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-navy-card/40 animate-pulse border border-navy-border" />
          ))}
        </div>
      ) : filteredExecs.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-navy-border bg-navy-card p-8">
          <p className="text-sm text-navy-body">No executive matches your search term "{searchQuery}".</p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-3 text-xs text-mint hover:underline font-semibold"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExecs.map((exec) => {
            const initials = getInitials(exec.name);
            const isGenSec = exec.officeSlug === "general-secretary";

            return (
              <div
                key={exec.id}
                onClick={() => setSelectedExec(exec)}
                className={`group cursor-pointer rounded-2xl border bg-navy-card p-5 transition-all hover:bg-navy-cardHover hover:border-mint/40 hover:shadow-xl flex flex-col justify-between ${
                  isGenSec ? "border-mint/50 bg-gradient-to-b from-navy-card via-navy-card to-mint/5" : "border-navy-border"
                }`}
              >
                <div className="space-y-4">
                  {/* Top Avatar & Position */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-mint/20 to-mint/5 border border-mint/30 font-extrabold text-mint text-base shadow-sm">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-navy-heading group-hover:text-mint transition-colors line-clamp-1">
                          {exec.name}
                        </h3>
                        <p className="text-xs font-semibold text-mint">{exec.position}</p>
                      </div>
                    </div>
                    {isGenSec && (
                      <span className="rounded-full bg-mint/20 border border-mint/30 px-2 py-0.5 text-[9px] font-extrabold text-mint uppercase">
                        Campaign Lead
                      </span>
                    )}
                  </div>

                  {/* One-Line "Go To Them For" */}
                  <div className="rounded-xl border border-navy-border bg-navy-bgStart/60 p-3">
                    <span className="text-[10px] font-bold uppercase text-navy-subtle block mb-0.5">
                      Go to them for:
                    </span>
                    <p className="text-xs text-navy-body line-clamp-2 leading-relaxed">
                      {exec.goToThemFor}
                    </p>
                  </div>
                </div>

                {/* 3 ACTION BUTTONS */}
                <div className="mt-5 pt-4 border-t border-navy-border flex items-center gap-2">
                  <Link
                    href={`/concern?office=${exec.officeSlug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 py-2 px-2 text-[11px] font-bold text-navy-onAccent bg-mint hover:bg-mint-hover rounded-xl shadow transition-colors flex items-center justify-center gap-1 min-h-touch"
                  >
                    <Send className="h-3 w-3" />
                    Concern
                  </Link>

                  <a
                    href={`mailto:${exec.officeEmail}`}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Email ${exec.name}`}
                    className="py-2 px-3 text-[11px] font-semibold text-navy-heading bg-navy-bgStart hover:bg-navy-border rounded-xl border border-navy-border transition-colors flex items-center justify-center min-h-touch"
                  >
                    <Mail className="h-3.5 w-3.5" />
                  </a>

                  <button
                    onClick={(e) => handleCopyEmail(e, exec.officeEmail, exec.officeSlug)}
                    aria-label="Copy email address"
                    className="py-2 px-3 text-[11px] font-semibold text-navy-heading bg-navy-bgStart hover:bg-navy-border rounded-xl border border-navy-border transition-colors flex items-center justify-center min-h-touch"
                  >
                    {copiedSlug === exec.officeSlug ? (
                      <Check className="h-3.5 w-3.5 text-mint" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL DRAWER MODAL */}
      {selectedExec && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedExec(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-navy-border bg-navy-bgStart p-6 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-navy-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/10 border border-mint/30 text-mint font-extrabold text-xl">
                  {getInitials(selectedExec.name)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-heading">{selectedExec.name}</h3>
                  <p className="text-xs font-semibold text-mint">{selectedExec.position}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedExec(null)}
                aria-label="Close modal"
                className="rounded-full p-2 text-navy-body hover:bg-navy-card hover:text-navy-heading"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Bio & Scope */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase text-navy-subtle mb-1">
                  Executive Bio & Role
                </h4>
                <p className="text-xs text-navy-body leading-relaxed">{selectedExec.bio}</p>
              </div>

              <div className="rounded-xl border border-navy-border bg-navy-card p-3.5 space-y-1">
                <h4 className="text-xs font-bold uppercase text-mint">
                  Go to this office for:
                </h4>
                <p className="text-xs text-navy-heading font-medium">
                  {selectedExec.goToThemFor}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-navy-subtle mb-1">
                  Official Office Email
                </h4>
                <div className="flex items-center justify-between rounded-xl border border-navy-border bg-navy-card px-3 py-2 text-xs font-mono text-navy-heading">
                  <span>{selectedExec.officeEmail}</span>
                  <button
                    onClick={(e) => handleCopyEmail(e, selectedExec.officeEmail, selectedExec.officeSlug)}
                    className="text-mint hover:underline font-bold text-[11px]"
                  >
                    {copiedSlug === selectedExec.officeSlug ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Modal CTA */}
            <div className="pt-2 flex gap-3">
              <Link
                href={`/concern?office=${selectedExec.officeSlug}`}
                onClick={() => setSelectedExec(null)}
                className="flex-1 py-3 text-xs font-bold text-navy-onAccent bg-mint hover:bg-mint-hover rounded-xl shadow text-center min-h-touch flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                Send Concern to {selectedExec.position}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
