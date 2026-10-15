import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { getAllAlumni, getAllSiwesPlacements, getRemovalRequests } from "@/lib/db";
import { createApprovalRequest } from "@/lib/approvals";

const schema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("placement"), id: z.string().min(1), approved: z.boolean() }),
  z.object({ kind: z.literal("alumnus"), id: z.string().min(1), approved: z.boolean() }),
  z.object({ kind: z.literal("remove-placement"), id: z.string().min(1) }),
  z.object({ kind: z.literal("remove-alumnus"), id: z.string().min(1) }),
  z.object({ kind: z.literal("resolve-removal"), id: z.string().min(1), resolved: z.boolean() }),
]);

export async function GET() {
  const gate = await gateOfficeCapability("ags.siwes.process");
  if ("response" in gate) return gate.response;
  try {
    const [placements, alumni, removalRequests] = await Promise.all([
      getAllSiwesPlacements(), getAllAlumni(), getRemovalRequests(),
    ]);
    return NextResponse.json({
      success: true,
      data: {
        placements: placements.filter((item) => !item.isApproved),
        alumni: alumni.filter((item) => !item.isApproved),
        removalRequests,
      },
    });
  } catch (error) {
    console.error("GET /api/office/secretariat/siwes error:", error);
    return NextResponse.json({ success: false, error: "Failed to load SIWES and alumni queue" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("ags.siwes.process");
  if ("response" in gate) return gate.response;
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    let type: string;
    let payload: Record<string, unknown>;
    switch (parsed.data.kind) {
      case "placement":
        type = "SIWES_PLACEMENT_APPROVAL";
        payload = { id: parsed.data.id, isApproved: parsed.data.approved, title: "Moderate SIWES placement" };
        break;
      case "alumnus":
        type = "ALUMNUS_APPROVAL";
        payload = { id: parsed.data.id, isApproved: parsed.data.approved, title: "Moderate alumni entry" };
        break;
      case "remove-placement":
        type = "SIWES_PLACEMENT_DELETE";
        payload = { id: parsed.data.id, title: "Remove SIWES placement" };
        break;
      case "remove-alumnus":
        type = "ALUMNUS_DELETE";
        payload = { id: parsed.data.id, title: "Remove alumni entry" };
        break;
      case "resolve-removal":
        type = "REMOVAL_REQUEST_RESOLUTION";
        payload = { id: parsed.data.id, isResolved: parsed.data.resolved, title: "Resolve removal request" };
        break;
    }
    const approval = await createApprovalRequest({ type, payload, makerOffice: gate.office });
    return NextResponse.json({ success: true, data: approval }, { status: 202 });
  } catch (error) {
    console.error("POST /api/office/secretariat/siwes error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit moderation for approval" }, { status: 500 });
  }
}
