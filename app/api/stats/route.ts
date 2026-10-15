import { NextResponse } from "next/server";
import { getPlatformStats } from "@/lib/db";

export async function GET() {
  try {
    const stats = await getPlatformStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
