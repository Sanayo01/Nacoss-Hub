import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { isOfficeSlug } from "@/config/permissions";
import { sanitizedText } from "@/lib/input-validation";
import { createExpenditureRequest } from "@/lib/remaining-offices";

const schema = z.object({
  title: sanitizedText(3, 160),
  purpose: sanitizedText(10, 3000),
  office: z.string().trim().min(2).max(80),
  event: z.string().trim().max(160).optional().nullable(),
  amount: z.number().positive().max(100000000),
  term: sanitizedText(2, 60).default("CURRENT"),
  receiptRef: z.string().trim().max(100).regex(/^[\w-]*$/).optional().nullable(),
});

export async function POST(request: NextRequest) {
  const gate = await gateOfficeCapability("serious.submit");
  if ("response" in gate) return gate.response;
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  if (!isOfficeSlug(parsed.data.office)) return NextResponse.json({ success: false, error: "Choose a valid responsible office." }, { status: 400 });
  try {
    const item = await createExpenditureRequest({ ...parsed.data, requestedBy: gate.office });
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("separate President account")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 409 });
    }
    console.error("POST /api/office/expenditure error:", error);
    return NextResponse.json({ success: false, error: "Could not submit expenditure request." }, { status: 500 });
  }
}
