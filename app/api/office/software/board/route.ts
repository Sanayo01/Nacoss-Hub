import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { listSoftwareBoard, updatePlatformRequest } from "@/lib/three-offices";

const schema = z.object({
  id: z.string().min(1),
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE", "DECLINED"]),
});

export async function GET() {
  const gate = await gateOfficeCapability("software.board");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await listSoftwareBoard() });
  } catch (error) {
    console.error("GET /api/office/software/board error:", error);
    return NextResponse.json({ success: false, error: "Failed to load platform board" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const gate = await gateOfficeCapability("software.board");
  if ("response" in gate) return gate.response;
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const updated = await updatePlatformRequest({ ...parsed.data, office: gate.office });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/office/software/board error:", error);
    return NextResponse.json({ success: false, error: "Failed to update platform request" }, { status: 500 });
  }
}
