import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isOfficeSlug } from "@/config/permissions";
import { gateOfficeCapability } from "@/lib/office-access";
import { createOversightQuery, listOversightQueries, respondToOversightQuery } from "@/lib/secretariat";

const createSchema = z.object({
  targetOffice: z.string().refine(isOfficeSlug),
  kind: z.enum(["QUERY", "REMINDER"]),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(5).max(5000),
});
const responseSchema = z.object({ id: z.string().min(1), response: z.string().trim().min(2).max(5000) });

export async function GET() {
  const gate = await gateOfficeCapability("oversight.respond");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await listOversightQueries(gate.office) });
  } catch (error) {
    console.error("GET /api/office/oversight error:", error);
    return NextResponse.json({ success: false, error: "Failed to load oversight records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("gensec.oversight.manage");
  if ("response" in gate) return gate.response;
  try {
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const data = await createOversightQuery({ ...parsed.data, createdBy: gate.office });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/office/oversight error:", error);
    return NextResponse.json({ success: false, error: "Failed to create oversight record" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const gate = await gateOfficeCapability("oversight.respond");
  if ("response" in gate) return gate.response;
  try {
    const parsed = responseSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const data = await respondToOversightQuery({ ...parsed.data, office: gate.office });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("PATCH /api/office/oversight error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Could not respond" }, { status: 409 });
  }
}
