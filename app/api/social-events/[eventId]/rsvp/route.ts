import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { submitEventRsvp } from "@/lib/three-offices";

const schema = z.object({
  studentName: z.string().trim().min(2).max(120).optional(),
  response: z.enum(["ATTENDING", "APOLOGIES"]),
});

export async function POST(req: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const rsvp = await submitEventRsvp({ eventId: params.eventId, ...parsed.data });
    return NextResponse.json({ success: true, data: { response: rsvp.response } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/social-events/[eventId]/rsvp error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Could not save RSVP" }, { status: 409 });
  }
}
