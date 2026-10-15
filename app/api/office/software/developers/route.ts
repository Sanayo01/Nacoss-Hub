import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { listSoftwareBoard, saveDeveloperVolunteer } from "@/lib/three-offices";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(120),
  skills: z.string().trim().min(2).max(500),
  availability: z.string().trim().min(2).max(300),
  assignedTask: z.string().trim().max(300).nullable().optional(),
});

export async function GET() {
  const gate = await gateOfficeCapability("software.roster");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: (await listSoftwareBoard()).developers });
  } catch (error) {
    console.error("GET /api/office/software/developers error:", error);
    return NextResponse.json({ success: false, error: "Failed to load developer roster" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("software.roster");
  if ("response" in gate) return gate.response;
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const volunteer = await saveDeveloperVolunteer({ ...parsed.data, office: gate.office });
    return NextResponse.json({ success: true, data: volunteer }, { status: parsed.data.id ? 200 : 201 });
  } catch (error) {
    console.error("POST /api/office/software/developers error:", error);
    return NextResponse.json({ success: false, error: "Failed to save developer volunteer" }, { status: 500 });
  }
}
