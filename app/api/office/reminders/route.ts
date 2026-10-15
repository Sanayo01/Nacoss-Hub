import { NextResponse } from "next/server";
import { gateOfficeCapability } from "@/lib/office-access";
import { sendDueMeetingReminders } from "@/lib/office-data";

export async function POST() {
  const gate = await gateOfficeCapability("meetings.view");
  if ("response" in gate) return gate.response;
  try {
    const sent = await sendDueMeetingReminders();
    return NextResponse.json({ success: true, remindersSent: sent.length });
  } catch (error) {
    console.error("POST /api/office/reminders error:", error);
    return NextResponse.json({ success: false, error: "Failed to send meeting reminders" }, { status: 500 });
  }
}
