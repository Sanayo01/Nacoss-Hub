"use client";

import Link from "next/link";
import {
  Calendar,
  FileText,
  Briefcase,
  Activity,
  BookOpen,
  Search,
  X,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface MoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MoreSheet({ isOpen, onClose }: MoreSheetProps) {
  if (!isOpen) return null;

  const menuItems = [
    {
      title: "Track a Concern",
      desc: "Check real-time response timeline with your Tracking ID",
      href: "/track",
      icon: Search,
      badge: "Lookup",
    },
    {
      title: "Departmental Calendar",
      desc: "Exam timetables, hackathons, and event feeds",
      href: "/calendar",
      icon: Calendar,
    },
    {
      title: "Events & Volunteering",
      desc: "Browse approved events, RSVP, and volunteer",
      href: "/events",
      icon: Calendar,
    },
    {
      title: "Platform Feedback",
      desc: "Report a bug or request a NACOS Hub feature",
      href: "/platform",
      icon: Activity,
    },
    {
      title: "Document Vault",
      desc: "Official letters, course guides, forms & templates",
      href: "/documents",
      icon: FileText,
    },
    {
      title: "SIWES Bridge",
      desc: "Internship placements, tech stacks & interview tips",
      href: "/siwes",
      icon: Briefcase,
    },
    {
      title: "Pulse Polls",
      desc: "Vote on departmental decisions anonymously",
      href: "/pulse",
      icon: Activity,
    },
    {
      title: "Student Handbook",
      desc: "How NACOS works, office duties & committee contacts",
      href: "/handbook",
      icon: BookOpen,
    },
    {
      title: "Prototype Status",
      desc: "What is real, mocked, and limitations of this build",
      href: "/about",
      icon: ShieldAlert,
      badge: "Info",
    },
    {
      title: "Admin Console",
      desc: "Executive inbox, announcement composer & moderation",
      href: "/admin",
      icon: Search,
    },
  ];


  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-navy-border bg-navy-bgStart p-6 shadow-2xl animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-navy-border mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-mint" />
            <h3 className="font-bold text-lg text-navy-heading uppercase tracking-wide">
              NACOS Hub Menu
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-full p-2 text-navy-body hover:bg-navy-card hover:text-navy-heading transition-colors min-h-touch min-w-touch flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu Items Grid */}
        <div className="grid gap-2 max-h-[70vh] overflow-y-auto pr-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="group flex items-center justify-between p-3.5 rounded-xl border border-navy-border bg-navy-card hover:bg-navy-cardHover hover:border-mint/30 transition-all min-h-touch"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint/10 border border-mint/20 text-mint group-hover:scale-105 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-navy-heading group-hover:text-mint transition-colors">
                        {item.title}
                      </h4>
                      {item.badge && (
                        <span className="rounded-full bg-mint/10 px-2 py-0.5 text-[10px] font-bold text-mint border border-mint/20">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-navy-body line-clamp-1">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-navy-subtle group-hover:text-mint group-hover:translate-x-0.5 transition-all" />
              </Link>
            );
          })}
        </div>

        {/* Neutral platform footer */}
        <div className="mt-4 pt-4 border-t border-navy-border text-center">
          <p className="text-[11px] text-navy-subtle">
            NACOS UNILAG · Student-to-Executive Platform
          </p>
        </div>
      </div>
    </div>
  );
}
