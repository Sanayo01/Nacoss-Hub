import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { castMotionVote } from "@/lib/motions";

const schema = z.object({ vote: z.enum(["FOR", "AGAINST", "ABSTAIN"]) });

export async function POST(req: NextRequest, { params }: { params: { motionId: string } }) {
  const gate = await gateOfficeCapability("motions.vote");
  if ("response" in gate) return gate.response;
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const data = await castMotionVote({ motionId: params.motionId, office: gate.office, vote: parsed.data.vote });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("POST /api/office/motions/[motionId]/vote error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Could not record vote" }, { status: 409 });
  }
}
