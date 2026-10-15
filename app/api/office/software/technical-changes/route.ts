import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { submitTechnicalChange } from "@/lib/three-offices";

const schema = z.object({
  title: z.string().trim().min(4).max(160),
  description: z.string().trim().min(10).max(3000),
});

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("software.technical-change");
  if ("response" in gate) return gate.response;
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const request = await submitTechnicalChange({ ...parsed.data, office: gate.office });
    return NextResponse.json({ success: true, data: request }, { status: 201 });
  } catch (error) {
    console.error("POST /api/office/software/technical-changes error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit two-key technical change" }, { status: 500 });
  }
}
