"use client";

import { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  Download,
  Rss,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  category: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "month">("list");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events");
        const json = await res.json();
        if (json.success) {
          setEvents(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const handleDownloadSingleICS = (event: CalendarEvent) => {
    const formatDate = (dateInput: string) =>
      new Date(dateInput).toISOString().replace(/-|:|\.\d+/g, "");

    const icsString = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//NACOS UNILAG//Event//EN",
      "BEGIN:VEVENT",
      `UID:nacos-event-${event.id}@nacos-unilag.org`,
      `DTSTAMP:${formatDate(new Date().toISOString())}`,
      `DTSTART:${formatDate(event.startsAt)}`,
      `DTEND:${formatDate(event.endsAt)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${event.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group events by week
  const groupedEvents = events.reduce((acc, ev) => {
    const d = new Date(ev.startsAt);
    const weekNumber = Math.ceil((d.getDate() + 6 - d.getDay()) / 7);
    const monthName = d.toLocaleString("default", { month: "long", year: "numeric" });
    const key = `Week ${weekNumber} - ${monthName}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ev);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  return (
    <div className="space-y-8 pb-8 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-mint/10 border border-mint/20 px-3 py-1 text-xs font-semibold text-mint">
            <CalendarIcon className="h-3.5 w-3.5" />
            NACOS UNILAG Academic & Event Schedule
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight text-navy-heading">
            Departmental Calendar
          </h1>
          <p className="text-xs md:text-sm text-navy-body max-w-xl">
            Never miss an exam test date, hackathon briefing, or guest lecture. Export individual events or subscribe to the full live calendar feed.
          </p>
        </div>

        {/* SUBSCRIBE TO CALENDAR FEED BUTTON */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href="/api/calendar.ics"
            download="nacos-unilag-calendar.ics"
            className="px-4 py-2.5 text-xs font-bold text-navy-onAccent bg-mint hover:bg-mint-hover rounded-xl shadow-lg transition-all min-h-touch flex items-center gap-2"
          >
            <Rss className="h-4 w-4" /> Subscribe to iCal Feed
          </a>
        </div>
      </div>

      {/* VIEW TOGGLE BAR */}
      <div className="flex items-center justify-between border-b border-navy-border pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors min-h-touch ${
              viewMode === "list"
                ? "border-mint bg-mint text-navy-onAccent"
                : "border-navy-border bg-navy-card text-navy-body hover:text-navy-heading"
            }`}
          >
            List View (Grouped)
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors min-h-touch ${
              viewMode === "month"
                ? "border-mint bg-mint text-navy-onAccent"
                : "border-navy-border bg-navy-card text-navy-body hover:text-navy-heading"
            }`}
          >
            Month View
          </button>
        </div>

        <span className="text-xs text-navy-subtle font-mono hidden sm:inline">
          {events.length} Upcoming Events
        </span>
      </div>

      {/* LIST VIEW (GROUPED BY WEEK) */}
      {viewMode === "list" && (
        <div className="space-y-8">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-navy-card/40 animate-pulse border border-navy-border" />
              ))}
            </div>
          ) : Object.keys(groupedEvents).length === 0 ? (
            <p className="text-xs text-navy-body text-center py-8">No upcoming events found.</p>
          ) : (
            Object.entries(groupedEvents).map(([weekLabel, weekEvents]) => (
              <div key={weekLabel} className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-mint border-b border-navy-border pb-1">
                  {weekLabel}
                </h2>

                <div className="grid gap-4">
                  {weekEvents.map((ev) => {
                    const startDate = new Date(ev.startsAt);
                    return (
                      <div
                        key={ev.id}
                        className="p-5 rounded-3xl border border-navy-border bg-navy-card hover:bg-navy-cardHover transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center justify-center h-14 w-14 rounded-2xl bg-mint/10 border border-mint/20 text-mint shrink-0 shadow-sm">
                            <span className="text-[10px] uppercase font-bold">
                              {startDate.toLocaleString("default", { month: "short" })}
                            </span>
                            <span className="text-xl font-extrabold leading-none">
                              {startDate.getDate()}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-navy-bgStart text-mint border border-mint/20">
                                {ev.category}
                              </span>
                            </div>

                            <h3 className="font-bold text-base text-navy-heading">{ev.title}</h3>

                            <p className="text-xs text-navy-body line-clamp-2">{ev.description}</p>

                            <div className="flex flex-wrap items-center gap-4 text-[11px] text-navy-subtle pt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-mint" /> {ev.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-mint" />{" "}
                                {startDate.toLocaleTimeString("en-NG", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownloadSingleICS(ev)}
                          className="px-4 py-2 text-xs font-bold text-navy-heading bg-navy-bgStart hover:bg-navy-border border border-navy-border hover:border-mint/50 rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0 min-h-touch"
                        >
                          <Download className="h-3.5 w-3.5 text-mint" /> Add to Calendar
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MONTH VIEW GRID */}
      {viewMode === "month" && (
        <div className="p-6 rounded-3xl border border-navy-border bg-navy-card space-y-4">
          <div className="text-center font-bold text-sm text-navy-heading uppercase tracking-wider mb-2">
            October 2026 Assessment & Event Grid
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-navy-subtle border-b border-navy-border pb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-xs text-navy-heading">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const hasEvent = events.some((ev) => new Date(ev.startsAt).getDate() === day);
              return (
                <div
                  key={day}
                  className={`h-16 rounded-xl border p-1.5 flex flex-col justify-between transition-colors ${
                    hasEvent
                      ? "border-mint bg-mint/10 text-mint font-bold shadow"
                      : "border-navy-border/50 bg-navy-bgStart/50 text-navy-body"
                  }`}
                >
                  <span className="text-[11px]">{day}</span>
                  {hasEvent && (
                    <span className="h-1.5 w-1.5 rounded-full bg-mint self-center animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
