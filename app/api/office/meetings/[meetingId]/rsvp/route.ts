import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { respondToMeeting } from "@/lib/office-data";

const rsvpSchema = z.object({ response: z.enum(["ATTENDING", "APOLOGIES"]) });

export async function POST(
  req: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  const gate = await gateOfficeCapability("meetings.view");
  if ("response" in gate) return gate.response;
  const parsed = rsvpSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
  }
  try {
    const data = await respondToMeeting(params.meetingId, gate.office, parsed.data.response);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("POST /api/office/meetings/[meetingId]/rsvp error:", error);
    return NextResponse.json({ success: false, error: "Failed to record RSVP" }, { status: 500 });
  }
}
