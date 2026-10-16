"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, Share2, Copy, Check, Pin } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  pinned: boolean;
  authorOfficeSlug: string;
  createdAt: string;
}

export default function SingleAnnouncementPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [ann, setAnn] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchSingle() {
      try {
        const res = await fetch(`/api/announcements/${id}`);
        const json = await res.json();
        if (json.success) {
          setAnn(json.data);
        }
      } catch (err) {
        console.error("Error loading announcement:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSingle();
  }, [id]);

  const handleCopyWhatsApp = () => {
    if (!ann) return;
    const text = `🚨 *NACOSS UNILAG ANNOUNCEMENT*\n\n📌 *${ann.title}*\n\n${ann.body}\n\n🔗 ${window.location.href}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="h-64 rounded-3xl bg-navy-card/40 animate-pulse border border-navy-border" />
      </div>
    );
  }

  if (!ann) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-navy-heading">Announcement Not Found</h2>
        <Link href="/announcements" className="text-xs text-mint hover:underline font-bold">
          &larr; Back to Announcements Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <Link
        href="/announcements"
        className="inline-flex items-center gap-1.5 text-xs text-navy-body hover:text-mint transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Announcements Feed
      </Link>

      <div className="p-6 md:p-8 rounded-3xl border border-navy-border bg-navy-card space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-navy-border pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-mint/10 text-mint border border-mint/20">
              {ann.category}
            </span>
            {ann.pinned && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-mint">
                <Pin className="h-3.5 w-3.5" /> Pinned
              </span>
            )}
          </div>
          <span className="text-xs font-mono text-navy-subtle">
            {new Date(ann.createdAt).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        <h1 className="text-xl md:text-3xl font-extrabold text-navy-heading leading-snug">
          {ann.title}
        </h1>

        <div className="text-xs md:text-sm text-navy-heading leading-relaxed whitespace-pre-line space-y-4">
          {ann.body}
        </div>

        <div className="pt-4 border-t border-navy-border flex items-center justify-between">
          <span className="text-xs text-navy-subtle">
            Issued by: <strong className="text-navy-heading">{ann.authorOfficeSlug}</strong>
          </span>

          <button
            onClick={handleCopyWhatsApp}
            className="px-4 py-2.5 text-xs font-bold text-navy-onAccent bg-mint hover:bg-mint-hover rounded-xl shadow transition-colors flex items-center gap-1.5 min-h-touch"
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? "Copied for WhatsApp!" : "Share to WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}
