import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { createMotion, getMotions, closeMotion } from "@/lib/motions";

const createSchema = z.object({
  meetingId: z.string().min(1),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(1).max(5000),
  quorumPercent: z.number().int().min(1).max(100),
});
const closeSchema = z.object({ closeMotionId: z.string().min(1) });

export async function GET() {
  const gate = await gateOfficeCapability("motions.vote");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await getMotions() });
  } catch (error) {
    console.error("GET /api/office/motions error:", error);
    return NextResponse.json({ success: false, error: "Failed to load motions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("president.motions");
  if ("response" in gate) return gate.response;
  try {
    const body: unknown = await req.json();
    const closeParsed = closeSchema.safeParse(body);
    if (closeParsed.success) {
      const data = await closeMotion(closeParsed.data.closeMotionId, gate.office);
      return NextResponse.json({ success: true, data });
    }
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const data = await createMotion({ ...parsed.data, createdBy: gate.office });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/office/motions error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Failed to update motion" }, { status: 400 });
  }
}
