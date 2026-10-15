import { NextResponse } from "next/server";
import { getPublicFinanceSummary } from "@/lib/remaining-offices";

export async function GET() {
  try { return NextResponse.json({ success: true, data: await getPublicFinanceSummary() }); }
  catch (error) {
    console.error("GET /api/finance error:", error);
    return NextResponse.json({ success: false, error: "Could not load public-safe financial summary." }, { status: 500 });
  }
}
