import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isOfficeSlug } from "@/config/permissions";
import { gateOfficeCapability } from "@/lib/office-access";
import { getExecutiveDirectory, updateExecutiveDirectory } from "@/lib/secretariat";

const schema = z.object({
  officeSlug: z.string().refine(isOfficeSlug),
  name: z.string().trim().min(2).max(80),
  officeEmail: z.string().email().max(254),
  isListed: z.boolean(),
  emailConsent: z.boolean(),
  photoUrl: z.string().max(500).nullable(),
});

export async function GET() {
  const gate = await gateOfficeCapability("gensec.directory.manage");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await getExecutiveDirectory() });
  } catch (error) {
    console.error("GET /api/office/general-secretary/directory error:", error);
    return NextResponse.json({ success: false, error: "Could not load executive directory" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const gate = await gateOfficeCapability("gensec.directory.manage");
  if ("response" in gate) return gate.response;
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const data = await updateExecutiveDirectory({ ...parsed.data, updatedBy: gate.office });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("PATCH /api/office/general-secretary/directory error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Could not update directory" }, { status: 400 });
  }
}
