import { NextResponse } from "next/server";
import { gateOfficeCapability } from "@/lib/office-access";
import { getExecutiveScorecard } from "@/lib/power-office-data";

export async function GET() {
  const gate = await gateOfficeCapability("president.scorecard");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await getExecutiveScorecard() });
  } catch (error) {
    console.error("GET /api/office/president/scorecard error:", error);
    return NextResponse.json({ success: false, error: "Failed to load executive scorecard" }, { status: 500 });
  }
}
