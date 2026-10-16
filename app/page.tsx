"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Send,
  Search,
  ArrowRight,
  Sparkles,
  Calendar as CalendarIcon,
  Bell,
  CheckCircle2,
  Clock,
  Inbox,
  Activity,
  HelpCircle,
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  pinned: boolean;
  createdAt: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  category: string;
}

interface PulsePoll {
  id: string;
  question: string;
  options: string;
  votes: { id: string; option: string }[];
}

interface Stats {
  concernsReceived: number;
  concernsResolved: number;
  medianResponseTime: string;
  activeSiwesCount?: number;
}

export default function HomePage() {
  const router = useRouter();
  const [trackingInput, setTrackingInput] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [activePoll, setActivePoll] = useState<PulsePoll | null>(null);
  const [stats, setStats] = useState<Stats>({
    concernsReceived: 0,
    concernsResolved: 0,
    medianResponseTime: "< 24h",
    activeSiwesCount: 0,
  });


  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [annRes, evRes, pollRes, statRes] = await Promise.all([
          fetch("/api/announcements").then((r) => r.json()),
          fetch("/api/events").then((r) => r.json()),
          fetch("/api/pulse").then((r) => r.json()),
          fetch("/api/stats").then((r) => r.json()),
        ]);

        if (annRes.success) setAnnouncements(annRes.data.slice(0, 3));
        if (evRes.success) setEvents(evRes.data.slice(0, 3));
        if (pollRes.success && pollRes.activePoll) setActivePoll(pollRes.activePoll);
        if (statRes.success) setStats(statRes.data);
      } catch (e) {
        console.error("Home page load error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      router.push(`/track/${trackingInput.trim().toUpperCase()}`);
    }
  };

  const quickPickCategories = [
    { label: "Academics & Tests", category: "Academics", icon: "📚", office: "Vice President" },
    { label: "Welfare & Lab Facilities", category: "Welfare", icon: "🏥", office: "Welfare Secretary" },
    { label: "Dues & Receipts", category: "Finance/Dues", icon: "💳", office: "Financial Secretary" },
    { label: "Events & Dinners", category: "Events", icon: "🎉", office: "Social Secretary" },
    { label: "Coding & Masterclass", category: "Software/Tech", icon: "💻", office: "Software Director" },
    { label: "Announcements & PR", category: "Media/Announcements", icon: "📢", office: "PRO" },
  ];

  return (
    <div className="space-y-10 pb-8">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl border border-navy-border bg-gradient-to-br from-navy-card via-navy-bgStart to-navy-card p-6 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-mint/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-mint/10 border border-mint/20 px-3 py-1 text-xs font-semibold text-mint">
            <Sparkles className="h-3.5 w-3.5" />
            NACOSS UNILAG Executive Hub
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-navy-heading leading-tight">
            COMMUNICATION THAT <span className="text-mint">REACHES YOU.</span>
          </h1>

          <p className="text-sm md:text-lg text-navy-body font-normal leading-relaxed">
            Records stay visible. Executives respond. Direct contact, routed concerns, transparent audit timelines, and official departmental feeds.
          </p>

          {/* TWO MAIN CTA BUTTONS & TRACKING INPUT */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4 pt-2">
            <Link
              href="/concern"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-bold text-navy-onAccent bg-mint hover:bg-mint-hover rounded-2xl shadow-xl shadow-mint/20 transition-all transform hover:-translate-y-0.5 min-h-touch"
            >
              <Send className="h-5 w-5" />
              Reach an Exec
            </Link>

            {/* Quick Track Inline Input */}
            <form onSubmit={handleTrackSubmit} className="flex-1 flex items-center rounded-2xl border border-navy-border bg-navy-bgStart p-1.5 focus-within:border-mint transition-colors">
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Enter Tracking ID (e.g. NH-2026-A1B2)"
                className="w-full bg-transparent px-3 text-xs md:text-sm text-navy-heading placeholder:text-navy-subtle focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 text-xs font-bold text-navy-heading bg-navy-card hover:bg-navy-cardHover hover:text-mint border border-navy-border rounded-xl transition-colors min-h-touch shrink-0 flex items-center gap-1"
              >
                <Search className="h-4 w-4" />
                Track
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* STATS STRIP (REAL DATA FROM DB) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-navy-border bg-navy-card text-center">
          <Inbox className="h-5 w-5 text-mint mb-1" />
          <span className="text-xl md:text-3xl font-extrabold text-navy-heading">
            {stats.concernsReceived}
          </span>
          <span className="text-[11px] md:text-xs text-navy-body">Concerns Received</span>
        </div>

        <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-navy-border bg-navy-card text-center">
          <CheckCircle2 className="h-5 w-5 text-mint mb-1" />
          <span className="text-xl md:text-3xl font-extrabold text-navy-heading">
            {stats.concernsResolved}
          </span>
          <span className="text-[11px] md:text-xs text-navy-body">Concerns Resolved</span>
        </div>

        <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-navy-border bg-navy-card text-center">
          <Clock className="h-5 w-5 text-mint mb-1" />
          <span className="text-xl md:text-3xl font-extrabold text-navy-heading">
            {stats.medianResponseTime}
          </span>
          <span className="text-[11px] md:text-xs text-navy-body">Response Time</span>
        </div>

        <Link
          href="/siwes"
          className="flex flex-col items-center justify-center p-4 rounded-2xl border border-navy-border bg-navy-card hover:border-mint/40 hover:bg-navy-cardHover transition-colors text-center group"
        >
          <span className="text-lg mb-1">💼</span>
          <span className="text-xl md:text-3xl font-extrabold text-navy-heading group-hover:text-mint transition-colors">
            {stats.activeSiwesCount ?? 0}
          </span>
          <span className="text-[11px] md:text-xs text-navy-body">On SIWES Now</span>
        </Link>
      </section>


      {/* FIND THE RIGHT EXEC QUICK-PICK */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-mint" />
            <h2 className="text-lg md:text-xl font-bold uppercase text-navy-heading tracking-wide">
              What do you need help with?
            </h2>
          </div>
          <Link href="/execs" className="text-xs text-mint hover:underline font-semibold flex items-center gap-1">
            View All 11 Execs <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickPickCategories.map((item) => (
            <Link
              key={item.category}
              href={`/concern?category=${encodeURIComponent(item.category)}`}
              className="group p-4 rounded-2xl border border-navy-border bg-navy-card hover:bg-navy-cardHover hover:border-mint/30 transition-all flex flex-col justify-between min-h-[100px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{item.icon}</span>
                <ArrowRight className="h-4 w-4 text-navy-subtle group-hover:text-mint group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="text-xs md:text-sm font-bold text-navy-heading group-hover:text-mint transition-colors mt-2">
                  {item.label}
                </h3>
                <p className="text-[11px] text-navy-body line-clamp-1">Routes to {item.office}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* LATEST ANNOUNCEMENTS & UPCOMING EVENTS GRID */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* LATEST ANNOUNCEMENTS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-mint" />
              <h2 className="text-lg font-bold uppercase text-navy-heading tracking-wide">
                Latest Announcements
              </h2>
            </div>
            <Link href="/announcements" className="text-xs text-mint hover:underline font-semibold">
              View Feed &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-navy-card/50 animate-pulse" />
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <p className="text-xs text-navy-body">No announcements yet.</p>
            ) : (
              announcements.map((ann) => (
                <Link
                  key={ann.id}
                  href={`/announcements/${ann.id}`}
                  className="block p-4 rounded-2xl border border-navy-border bg-navy-card hover:bg-navy-cardHover transition-colors group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      ann.category === "Urgent"
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : "bg-mint/10 text-mint border-mint/20"
                    }`}>
                      {ann.category}
                    </span>
                    {ann.pinned && (
                      <span className="text-[10px] font-semibold text-mint">📌 Pinned</span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-navy-heading group-hover:text-mint transition-colors line-clamp-1">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-navy-body line-clamp-2 mt-1">{ann.body}</p>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* COMING UP EVENTS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-mint" />
              <h2 className="text-lg font-bold uppercase text-navy-heading tracking-wide">
                Coming Up
              </h2>
            </div>
            <Link href="/calendar" className="text-xs text-mint hover:underline font-semibold">
              Full Calendar &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-navy-card/50 animate-pulse" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <p className="text-xs text-navy-body">No upcoming events scheduled.</p>
            ) : (
              events.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-start gap-3.5 p-4 rounded-2xl border border-navy-border bg-navy-card"
                >
                  <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-mint/10 border border-mint/20 text-mint shrink-0">
                    <span className="text-[10px] uppercase font-bold">
                      {new Date(ev.startsAt).toLocaleString("default", { month: "short" })}
                    </span>
                    <span className="text-base font-extrabold leading-none">
                      {new Date(ev.startsAt).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-navy-subtle uppercase">
                      {ev.category} &bull; {ev.location}
                    </span>
                    <h3 className="font-bold text-sm text-navy-heading line-clamp-1">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-navy-body line-clamp-1 mt-0.5">
                      {ev.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ACTIVE PULSE POLL PREVIEW */}
      {activePoll && (
        <section className="p-6 rounded-3xl border border-navy-border bg-gradient-to-r from-navy-card via-navy-bgStart to-navy-card shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-mint" />
              <span className="text-xs font-bold text-mint uppercase tracking-wider">
                Active Student Pulse Poll
              </span>
            </div>
            <Link href="/pulse" className="text-xs text-mint hover:underline font-semibold">
              Vote & View Results &rarr;
            </Link>
          </div>

          <h3 className="text-base md:text-lg font-bold text-navy-heading">
            {activePoll.question}
          </h3>

          <Link
            href="/pulse"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-navy-onAccent bg-mint hover:bg-mint-hover rounded-xl shadow-md transition-all"
          >
            Cast Your Anonymous Vote
          </Link>
        </section>
      )}
    </div>
  );
}
