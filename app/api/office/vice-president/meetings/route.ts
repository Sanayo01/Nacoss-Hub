import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { createApprovalRequest } from "@/lib/approvals";

const schema = z.object({
  title: z.string().trim().min(3).max(160),
  date: z.string().datetime(),
  venue: z.string().trim().min(2).max(300),
  agenda: z.string().trim().min(1).max(5000),
  mandatory: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("vp.meeting.request");
  if ("response" in gate) return gate.response;
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const data = await createApprovalRequest({
      type: "VP_MEETING_REQUEST",
      payload: parsed.data,
      makerOffice: gate.office,
    });
    return NextResponse.json({ success: true, data }, { status: 202 });
  } catch (error) {
    console.error("POST /api/office/vice-president/meetings error:", error);
    return NextResponse.json({ success: false, error: "Failed to request a meeting" }, { status: 500 });
  }
}
