import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { sanitizedText } from "@/lib/input-validation";
import { createWelfareResource, listWelfareWorkspace, updateWelfareCase } from "@/lib/remaining-offices";

const statusSchema = z.object({
  action: z.literal("STATUS"),
  id: z.string().min(1).max(100),
  status: z.enum(["OPEN", "IN_PROGRESS", "REFERRED", "CLOSED"]),
});
const resourceSchema = z.object({
  action: z.enum(["REFERRAL", "DRIVE", "RESOURCE"]),
  title: sanitizedText(2, 160),
  description: sanitizedText(3, 3000),
  contact: z.string().trim().max(240).transform((value) => value.replace(/<[^>]*>?/gm, "" )).optional(),
  link: z.string().url().max(1000).optional().nullable(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});

export async function GET() {
  const gate = await gateOfficeCapability("welfare.cases.view");
  if ("response" in gate) return gate.response;
  try { return NextResponse.json({ success: true, data: await listWelfareWorkspace() }); }
  catch (error) {
    console.error("GET /api/office/welfare error:", error);
    return NextResponse.json({ success: false, error: "Could not load confidential welfare workspace." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await gateOfficeCapability("welfare.resources.manage");
  if ("response" in gate) return gate.response;
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 }); }
  const parsed = resourceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid welfare resource." }, { status: 400 });
  try {
    const result = await createWelfareResource({
      ...parsed.data,
      kind: parsed.data.action,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined,
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : undefined,
      office: gate.office,
    });
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/office/welfare error:", error);
    return NextResponse.json({ success: false, error: "Could not save welfare resource." }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const gate = await gateOfficeCapability("welfare.cases.manage");
  if ("response" in gate) return gate.response;
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 }); }
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid case update." }, { status: 400 });
  try {
    return NextResponse.json({ success: true, data: await updateWelfareCase({ ...parsed.data, office: gate.office }) });
  } catch (error) {
    console.error("PATCH /api/office/welfare error:", error);
    return NextResponse.json({ success: false, error: "Could not update welfare case." }, { status: 404 });
  }
}
