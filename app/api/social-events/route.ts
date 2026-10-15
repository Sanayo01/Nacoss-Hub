import { NextResponse } from "next/server";
import { listPublicSocialEvents } from "@/lib/three-offices";

export async function GET() {
  try {
    const events = await listPublicSocialEvents();
    return NextResponse.json({
      success: true,
      data: events.map(({ id, title, description, venue, startsAt, endsAt, _count }) => ({
        id, title, description, venue, startsAt, endsAt,
        _count: { volunteers: _count.volunteers, rsvps: _count.rsvps },
      })),
    });
  } catch (error) {
    console.error("GET /api/social-events error:", error);
    return NextResponse.json({ success: false, error: "Failed to load public events" }, { status: 500 });
  }
}
