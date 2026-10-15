import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { createApprovalRequest, decideApproval, listApprovalRequests } from "@/lib/approvals";

const requestSchema = z.object({
  type: z.enum([
    "GENERAL_ACTION",
    "OFFICIAL_ANNOUNCEMENT",
    "URGENT_ANNOUNCEMENT",
    "SPENDING",
    "OFFICE_ACTIVATION",
    "ROLE_CHANGE",
    "FULL_STUDENT_DATA_EXPORT",
    "VP_MEETING_REQUEST",
    "OFFICIAL_LETTER_APPROVAL",
  ]),
  payload: z.record(z.unknown()),
  expiresInHours: z.number().int().min(1).max(720).optional(),
});
const decisionSchema = z.object({
  requestId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().trim().max(1000).optional(),
});

export async function GET() {
  const gate = await gateOfficeCapability("approvals.view");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await listApprovalRequests(gate.office, gate.actingFor) });
  } catch (error) {
    console.error("GET /api/office/approvals error:", error);
    return NextResponse.json({ success: false, error: "Failed to load approvals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("serious.submit");
  if ("response" in gate) return gate.response;
  try {
    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    if (parsed.data.type.includes("ANNOUNCEMENT")) {
      const content = z.object({
        title: z.string().trim().min(3).max(200),
        body: z.string().trim().min(10).max(10000),
      }).safeParse(parsed.data.payload);
      if (!content.success) {
        return NextResponse.json({ success: false, error: content.error.issues[0].message }, { status: 400 });
      }
    }
    if (parsed.data.type === "SPENDING") {
      const amount = Number(parsed.data.payload.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ success: false, error: "A positive spending amount is required." }, { status: 400 });
      }
    }
    const data = await createApprovalRequest({
      ...parsed.data,
      makerOffice: gate.office,
    });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/office/approvals error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit approval request" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const gate = await gateOfficeCapability("approvals.decide");
  if ("response" in gate) return gate.response;
  try {
    const parsed = decisionSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    const data = await decideApproval({ ...parsed.data, office: gate.office, actingFor: gate.actingFor });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to decide approval";
    console.error("PATCH /api/office/approvals error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 409 });
  }
}
