import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import {
  getAllSiwesPlacements,
  getAllAlumni,
  getSiwesCheckIns,
  getRemovalRequests,
} from "@/lib/db";
import { createApprovalRequest } from "@/lib/approvals";

const updateSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("toggle-approval"),
    type: z.enum(["placement", "alumni"]),
    id: z.string().min(1),
    isApproved: z.boolean(),
  }),
  z.object({
    action: z.literal("resolve-removal"),
    id: z.string().min(1),
    isResolved: z.boolean(),
  }),
]);

export async function GET() {
  const gate = await gateOfficeCapability("reports.view");
  if ("response" in gate) return gate.response;
  try {
    const [placements, alumni, checkIns, removalRequests] = await Promise.all([
      getAllSiwesPlacements(),
      getAllAlumni(),
      getSiwesCheckIns(),
      getRemovalRequests(),
    ]);
    return NextResponse.json({ success: true, data: { placements, alumni, checkIns, removalRequests } });
  } catch (error) {
    console.error("GET /api/admin/siwes error:", error);
    return NextResponse.json({ success: false, error: "Failed to load moderation data" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const gate = await gateOfficeCapability("serious.submit");
  if ("response" in gate) return gate.response;
  try {
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    const request = parsed.data.action === "resolve-removal"
      ? await createApprovalRequest({
          type: "REMOVAL_REQUEST_RESOLUTION",
          payload: { id: parsed.data.id, isResolved: parsed.data.isResolved, title: "Resolve SIWES/alumni removal request" },
          makerOffice: gate.office,
        })
      : await createApprovalRequest({
          type: parsed.data.type === "placement" ? "SIWES_PLACEMENT_APPROVAL" : "ALUMNUS_APPROVAL",
          payload: { id: parsed.data.id, isApproved: parsed.data.isApproved, title: "Moderate SIWES/alumni record" },
          makerOffice: gate.office,
        });
    return NextResponse.json({ success: true, message: "Action submitted for approval", data: request }, { status: 202 });
  } catch (error) {
    console.error("PATCH /api/admin/siwes error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit moderation action" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const gate = await gateOfficeCapability("serious.submit");
  if ("response" in gate) return gate.response;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  if (!id || (type !== "placement" && type !== "alumni")) {
    return NextResponse.json({ success: false, error: "A valid type and ID are required" }, { status: 400 });
  }
  try {
    const request = await createApprovalRequest({
      type: type === "placement" ? "SIWES_PLACEMENT_DELETE" : "ALUMNUS_DELETE",
      payload: { id, title: `Delete ${type} record` },
      makerOffice: gate.office,
    });
    return NextResponse.json({ success: true, message: "Deletion submitted for approval", data: request }, { status: 202 });
  } catch (error) {
    console.error("DELETE /api/admin/siwes error:", error);
    return NextResponse.json({ success: false, error: "Failed to request deletion" }, { status: 500 });
  }
}
