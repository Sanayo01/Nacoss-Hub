import { NextResponse } from "next/server";
import { getExecutives } from "@/lib/db";

export async function GET() {
  try {
    const executives = await getExecutives();
    return NextResponse.json({ success: true, data: executives });
  } catch (error) {
    console.error("GET /api/executives error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch executives" },
      { status: 500 }
    );
  }
}
