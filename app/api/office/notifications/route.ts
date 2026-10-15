import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { getOfficeNotifications, markNotificationRead } from "@/lib/office-data";

const readSchema = z.object({ id: z.string().min(1) });

export async function GET() {
  const gate = await gateOfficeCapability("notifications.view");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await getOfficeNotifications(gate.office) });
  } catch (error) {
    console.error("GET /api/office/notifications error:", error);
    return NextResponse.json({ success: false, error: "Failed to load notifications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const gate = await gateOfficeCapability("notifications.view");
  if ("response" in gate) return gate.response;
  const parsed = readSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
  }
  try {
    await markNotificationRead(parsed.data.id, gate.office);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/office/notifications error:", error);
    return NextResponse.json({ success: false, error: "Failed to update notification" }, { status: 500 });
  }
}
