import { NextResponse } from "next/server";
import { listPublicSportsSummary } from "@/lib/remaining-offices";

export async function GET() {
  try { return NextResponse.json({ success: true, data: await listPublicSportsSummary() }); }
  catch (error) {
    console.error("GET /api/sports error:", error);
    return NextResponse.json({ success: false, error: "Could not load public sports information." }, { status: 500 });
  }
}
