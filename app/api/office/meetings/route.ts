import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { createOfficeMeeting, getOfficeMeetings } from "@/lib/office-data";

const createMeetingSchema = z.object({
  title: z.string().trim().min(3).max(160),
  date: z.string().datetime(),
  venue: z.string().trim().min(2).max(300),
  agenda: z.string().trim().min(1).max(5000),
  mandatory: z.boolean().default(false),
});

export async function GET() {
  const gate = await gateOfficeCapability("meetings.view");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await getOfficeMeetings(gate.office) });
  } catch (error) {
    console.error("GET /api/office/meetings error:", error);
    return NextResponse.json({ success: false, error: "Failed to load meetings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("meetings.create");
  if ("response" in gate) return gate.response;
  try {
    const parsed = createMeetingSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    const meeting = await createOfficeMeeting({
      ...parsed.data,
      date: new Date(parsed.data.date),
      createdBy: gate.office,
    });
    return NextResponse.json({ success: true, data: meeting }, { status: 201 });
  } catch (error) {
    console.error("POST /api/office/meetings error:", error);
    return NextResponse.json({ success: false, error: "Failed to create meeting" }, { status: 500 });
  }
}
