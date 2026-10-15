import { NextResponse } from "next/server";
import { getCalendarEvents } from "@/lib/db";

export async function GET() {
  try {
    const events = await getCalendarEvents();
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}
