import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { createCommittee, getCommittees } from "@/lib/power-office-data";
import { isOfficeSlug } from "@/config/permissions";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(3000).default(""),
  members: z.array(z.string()).min(1),
});

export async function GET() {
  const gate = await gateOfficeCapability("vp.committees");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await getCommittees() });
  } catch (error) {
    console.error("GET /api/office/vice-president/committees error:", error);
    return NextResponse.json({ success: false, error: "Failed to load committees" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("vp.committees");
  if ("response" in gate) return gate.response;
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    if (parsed.data.members.some((office) => !isOfficeSlug(office))) {
      return NextResponse.json({ success: false, error: "Committee members must be valid offices." }, { status: 400 });
    }
    const committee = await createCommittee({
      ...parsed.data,
      createdBy: gate.office,
      members: parsed.data.members.filter(isOfficeSlug),
    });
    return NextResponse.json({ success: true, data: committee }, { status: 201 });
  } catch (error) {
    console.error("POST /api/office/vice-president/committees error:", error);
    return NextResponse.json({ success: false, error: "Failed to create committee" }, { status: 500 });
  }
}
