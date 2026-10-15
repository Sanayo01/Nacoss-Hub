import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { createContentCalendarItem } from "@/lib/three-offices";

const schema = z.object({
  title: z.string().trim().min(3).max(200),
  channel: z.string().trim().min(2).max(80),
  scheduledAt: z.string().datetime(),
  notes: z.string().trim().max(2000).default(""),
});

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("pro.calendar");
  if ("response" in gate) return gate.response;
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const item = await createContentCalendarItem({
      ...parsed.data, scheduledAt: new Date(parsed.data.scheduledAt), office: gate.office,
    });
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error("POST /api/office/pro/calendar error:", error);
    return NextResponse.json({ success: false, error: "Failed to schedule content" }, { status: 500 });
  }
}
