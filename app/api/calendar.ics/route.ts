import { NextResponse } from "next/server";
import { getCalendarEvents } from "@/lib/db";

function formatDateToICS(dateStr: Date | string): string {
  const d = new Date(dateStr);
  return d.toISOString().replace(/-|:|\.\d+/g, "");
}

export async function GET() {
  try {
    const events = await getCalendarEvents();

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//NACOSS UNILAG//Departmental Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:NACOSS UNILAG Events",
      "X-WR-TIMEZONE:Africa/Lagos",
    ];

    events.forEach((ev) => {
      const dtStart = formatDateToICS(ev.startsAt);
      const dtEnd = formatDateToICS(ev.endsAt);
      const now = formatDateToICS(new Date());

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:nacoss-event-${ev.id}@nacoss-unilag.org`,
        `DTSTAMP:${now}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${ev.title.replace(/\n/g, " ")}`,
        `DESCRIPTION:${(ev.description || "").replace(/\n/g, " ")}`,
        `LOCATION:${(ev.location || "UNILAG Main Campus").replace(/\n/g, " ")}`,
        "STATUS:CONFIRMED",
        "END:VEVENT"
      );
    });

    icsContent.push("END:VCALENDAR");

    const body = icsContent.join("\r\n");

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="nacoss-unilag-calendar.ics"',
      },
    });
  } catch (error) {
    console.error("GET /api/calendar.ics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate iCalendar feed" },
      { status: 500 }
    );
  }
}
