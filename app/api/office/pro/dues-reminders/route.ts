import { NextResponse } from "next/server";
import { gateOfficeCapability } from "@/lib/office-access";
import { listProDuesReminderDrafts } from "@/lib/remaining-offices";

export async function GET() {
  const gate = await gateOfficeCapability("pro.reminders.view");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await listProDuesReminderDrafts() });
  } catch (error) {
    console.error("GET /api/office/pro/dues-reminders error:", error);
    return NextResponse.json({ success: false, error: "Failed to load dues reminder drafts." }, { status: 500 });
  }
}
