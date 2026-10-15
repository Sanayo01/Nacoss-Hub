import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { submitEventFeedback } from "@/lib/three-offices";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  feedback: z.string().trim().min(3).max(3000),
});

export async function POST(req: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    await submitEventFeedback({ eventId: params.eventId, ...parsed.data });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/social-events/[eventId]/feedback error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Could not save feedback" }, { status: 409 });
  }
}
