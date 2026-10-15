import { NextRequest, NextResponse } from "next/server";
import { getAnnouncementById, incrementAnnouncementView } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcement = await getAnnouncementById(params.id);
    if (!announcement) {
      return NextResponse.json(
        { success: false, error: "Announcement not found" },
        { status: 404 }
      );
    }
    const viewed = await incrementAnnouncementView(params.id);
    return NextResponse.json({ success: true, data: viewed });
  } catch (error) {
    console.error("GET /api/announcements/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch announcement" },
      { status: 500 }
    );
  }
}
