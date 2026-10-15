import { NextResponse } from "next/server";
import { gateOfficeCapability } from "@/lib/office-access";
import { getCoordinationBoard } from "@/lib/power-office-data";

export async function GET() {
  const gate = await gateOfficeCapability("vp.coordinate");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await getCoordinationBoard() });
  } catch (error) {
    console.error("GET /api/office/vice-president/coordination error:", error);
    return NextResponse.json({ success: false, error: "Failed to load coordination board" }, { status: 500 });
  }
}
