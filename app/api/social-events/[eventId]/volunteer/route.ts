import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { volunteerForEvent } from "@/lib/three-offices";

const schema = z.object({
  studentName: z.string().trim().min(2).max(120),
  task: z.string().trim().min(2).max(200),
  hoursOptIn: z.boolean(),
});

export async function POST(req: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const volunteer = await volunteerForEvent({ eventId: params.eventId, ...parsed.data });
    return NextResponse.json({ success: true, data: { id: volunteer.id, hoursOptIn: volunteer.hoursOptIn } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/social-events/[eventId]/volunteer error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Could not register volunteer" }, { status: 409 });
  }
}
