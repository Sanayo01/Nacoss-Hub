"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  Pin,
  Share2,
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  X as XIcon,
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  pinned: boolean;
  authorOfficeSlug: string;
  createdAt: string;
}

const CATEGORIES = ["All", "Urgent", "Academic", "Event", "Deadline", "General"];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [shareModalAnn, setShareModalAnn] = useState<Announcement | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch("/api/announcements");
        const json = await res.json();
        if (json.success) {
          setAnnouncements(json.data);
        }
      } catch (err) {
        console.error("Failed to load announcements:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnouncements();
  }, []);

  const filtered = announcements.filter((a) => {
    const matchesCat = selectedCategory === "All" || a.category === selectedCategory;
    const matchesQuery =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleCopyWhatsApp = (ann: Announcement) => {
    const text = `🚨 *NACOS UNILAG OFFICIAL ANNOUNCEMENT*\n\n📌 *${ann.title}*\n\n${ann.body}\n\n🔗 View on NACOS Hub: ${window.location.origin}/announcements/${ann.id}\n\n#NACOSUNILAG`;
    navigator.clipboard.writeText(text);
    triggerCopied("whatsapp");
  };

  const handleCopyIG = (ann: Announcement) => {
    const text = `📢 NACOS UNILAG: ${ann.title}\n\n${ann.body.substring(0, 180)}...\n\nFull details on NACOS Hub!\n#NACOSUNILAG`;
    navigator.clipboard.writeText(text);
    triggerCopied("ig");
  };

  const handleCopyLink = (ann: Announcement) => {
    const link = `${window.location.origin}/announcements/${ann.id}`;
    navigator.clipboard.writeText(link);
    triggerCopied("link");
  };

  const triggerCopied = (type: string) => {
    setCopySuccess(type);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  return (
    <div className="space-y-8 pb-8 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-mint/10 border border-mint/20 px-3 py-1 text-xs font-semibold text-mint">
          <Bell className="h-3.5 w-3.5" />
          Official Departmental Broadcasts
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight text-navy-heading">
          Announcements Feed
        </h1>
        <p className="text-sm text-navy-body">
          Verified departmental notices, exam test changes, hackathon releases, and deadline alerts. One-click PRO sharing to WhatsApp & Social Media.
        </p>
      </div>

      {/* CATEGORY FILTER CHIPS & SEARCH */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-subtle" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements by title or keyword..."
            className="w-full rounded-2xl border border-navy-border bg-navy-card py-3 pl-10 pr-4 text-xs md:text-sm text-navy-heading placeholder:text-navy-subtle focus:border-mint focus:outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors whitespace-nowrap min-h-touch ${
                selectedCategory === cat
                  ? "border-mint bg-mint text-navy-bgStart"
                  : "border-navy-border bg-navy-card text-navy-body hover:text-navy-heading"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ANNOUNCEMENTS FEED LIST */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-navy-card/40 animate-pulse border border-navy-border" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-navy-border bg-navy-card">
          <p className="text-sm text-navy-body">No announcements found matching your filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ann) => {
            const isUrgent = ann.category === "Urgent";

            return (
              <div
                key={ann.id}
                className={`p-6 rounded-3xl border transition-all space-y-3 bg-navy-card ${
                  isUrgent
                    ? "border-red-500/50 bg-gradient-to-r from-red-500/10 via-navy-card to-navy-card shadow-lg shadow-red-500/5"
                    : ann.pinned
                    ? "border-mint/40 bg-gradient-to-r from-mint/5 via-navy-card to-navy-card"
                    : "border-navy-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                        isUrgent
                          ? "bg-red-500/20 text-red-400 border-red-500/40"
                          : "bg-mint/10 text-mint border-mint/20"
                      }`}
                    >
                      {ann.category}
                    </span>
                    {ann.pinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-mint">
                        <Pin className="h-3 w-3" /> Pinned
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-navy-subtle">
                    {new Date(ann.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>

                <Link href={`/announcements/${ann.id}`} className="block group">
                  <h2 className="text-base md:text-lg font-bold text-navy-heading group-hover:text-mint transition-colors">
                    {ann.title}
                  </h2>
                </Link>

                <p className="text-xs md:text-sm text-navy-body leading-relaxed whitespace-pre-line">
                  {ann.body}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-navy-border/50 text-xs">
                  <span className="text-navy-subtle text-[11px]">
                    By: <strong className="text-navy-heading">{ann.authorOfficeSlug}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShareModalAnn(ann)}
                      className="px-3 py-1.5 text-xs font-bold text-mint bg-mint/10 hover:bg-mint/20 border border-mint/30 rounded-xl transition-colors flex items-center gap-1.5 min-h-touch"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </button>
                    <Link
                      href={`/announcements/${ann.id}`}
                      className="px-3 py-1.5 text-xs font-semibold text-navy-heading hover:text-mint transition-colors flex items-center gap-1"
                    >
                      Open Link <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SHARE MODAL */}
      {shareModalAnn && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setShareModalAnn(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-navy-border bg-navy-bgStart p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-navy-border pb-3">
              <div>
                <h3 className="font-bold text-base text-navy-heading uppercase">Share Announcement</h3>
                <p className="text-xs text-navy-body line-clamp-1">{shareModalAnn.title}</p>
              </div>
              <button
                onClick={() => setShareModalAnn(null)}
                className="p-2 rounded-full text-navy-body hover:bg-navy-card"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleCopyWhatsApp(shareModalAnn)}
                className="w-full p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-between transition-colors min-h-touch"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="h-5 w-5" />
                  <span>Copy Formatted for WhatsApp</span>
                </div>
                {copySuccess === "whatsapp" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>

              <button
                onClick={() => handleCopyIG(shareModalAnn)}
                className="w-full p-3.5 rounded-2xl border border-navy-border bg-navy-card hover:bg-navy-cardHover text-navy-heading font-bold text-xs flex items-center justify-between transition-colors min-h-touch"
              >
                <div className="flex items-center gap-2.5">
                  <Share2 className="h-5 w-5 text-mint" />
                  <span>Copy Short (Instagram / X)</span>
                </div>
                {copySuccess === "ig" ? <Check className="h-4 w-4 text-mint" /> : <Copy className="h-4 w-4" />}
              </button>

              <button
                onClick={() => handleCopyLink(shareModalAnn)}
                className="w-full p-3.5 rounded-2xl border border-navy-border bg-navy-card hover:bg-navy-cardHover text-navy-heading font-bold text-xs flex items-center justify-between transition-colors min-h-touch"
              >
                <div className="flex items-center gap-2.5">
                  <ExternalLink className="h-5 w-5 text-mint" />
                  <span>Copy Direct URL Link</span>
                </div>
                {copySuccess === "link" ? <Check className="h-4 w-4 text-mint" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
