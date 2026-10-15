import { NextRequest, NextResponse } from "next/server";
import { isOfficeSlug } from "@/config/permissions";
import { gateOfficeCapability } from "@/lib/office-access";
import { getSecretariatConcerns, reassignSecretariatConcern } from "@/lib/secretariat";
import { z } from "zod";

const schema = z.object({ concernId: z.string().min(1), targetOffice: z.string().refine(isOfficeSlug) });

export async function GET() {
  const gate = await gateOfficeCapability("gensec.concerns.manage");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await getSecretariatConcerns() });
  } catch (error) {
    console.error("GET /api/office/general-secretary/concerns error:", error);
    return NextResponse.json({ success: false, error: "Failed to load concern command" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const gate = await gateOfficeCapability("gensec.concerns.manage");
  if ("response" in gate) return gate.response;
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const data = await reassignSecretariatConcern({
      concernId: parsed.data.concernId,
      targetOffice: parsed.data.targetOffice,
      actorOffice: gate.office,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("PATCH /api/office/general-secretary/concerns error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Could not reassign concern" }, { status: 409 });
  }
}
