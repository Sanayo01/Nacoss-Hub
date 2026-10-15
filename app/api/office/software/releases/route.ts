import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { createReleaseNote, listSoftwareBoard } from "@/lib/three-offices";

const schema = z.object({
  version: z.string().trim().min(1).max(40),
  title: z.string().trim().min(3).max(160),
  notes: z.string().trim().min(5).max(5000),
  published: z.boolean().default(false),
});

export async function GET() {
  const gate = await gateOfficeCapability("software.release");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: (await listSoftwareBoard()).releases });
  } catch (error) {
    console.error("GET /api/office/software/releases error:", error);
    return NextResponse.json({ success: false, error: "Failed to load release notes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("software.release");
  if ("response" in gate) return gate.response;
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const release = await createReleaseNote({ ...parsed.data, office: gate.office });
    return NextResponse.json({ success: true, data: release }, { status: 201 });
  } catch (error) {
    console.error("POST /api/office/software/releases error:", error);
    return NextResponse.json({ success: false, error: "Failed to save release notes" }, { status: 500 });
  }
}
