import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { sanitizedText } from "@/lib/input-validation";
import { listSportsWorkspace, saveSportsRecord, updateSportsResult } from "@/lib/remaining-offices";

const createSchema = z.object({
  kind: z.enum(["TEAM", "FIXTURE", "TRAINING", "EQUIPMENT", "ACHIEVEMENT"]),
  title: sanitizedText(2, 160),
  details: sanitizedText(2, 2000),
  date: z.string().datetime().optional(),
  venue: z.string().trim().max(200).optional(),
  quantity: z.number().int().min(0).max(10000).optional(),
  roster: z.array(sanitizedText(2, 100)).max(100).optional(),
});
const resultSchema = z.object({
  fixtureId: z.string().min(1).max(100),
  result: sanitizedText(1, 120),
});

export async function GET() {
  const gate = await gateOfficeCapability("sports.manage");
  if ("response" in gate) return gate.response;
  try { return NextResponse.json({ success: true, data: await listSportsWorkspace() }); }
  catch (error) {
    console.error("GET /api/office/sports error:", error);
    return NextResponse.json({ success: false, error: "Could not load sports workspace." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await gateOfficeCapability("sports.manage");
  if ("response" in gate) return gate.response;
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 }); }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid sports record." }, { status: 400 });
  try {
    const saved = await saveSportsRecord({
      ...parsed.data,
      date: parsed.data.date ? new Date(parsed.data.date) : undefined,
      office: gate.office,
    });
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/office/sports error:", error);
    return NextResponse.json({ success: false, error: "Could not save sports record." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const gate = await gateOfficeCapability("sports.manage");
  if ("response" in gate) return gate.response;
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 }); }
  const parsed = resultSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid fixture result." }, { status: 400 });
  try {
    return NextResponse.json({ success: true, data: await updateSportsResult({ ...parsed.data, office: gate.office }) });
  } catch (error) {
    console.error("PATCH /api/office/sports error:", error);
    return NextResponse.json({ success: false, error: "Could not record fixture result." }, { status: 500 });
  }
}
