import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { optionalSanitizedText, sanitizedText } from "@/lib/input-validation";
import { submitFinanceQuery } from "@/lib/remaining-offices";

const schema = z.object({
  subject: sanitizedText(3, 160),
  message: sanitizedText(10, 3000),
  isAnonymous: z.boolean().default(false),
  senderName: optionalSanitizedText(100),
  senderEmail: z.string().trim().email().max(254).optional().nullable().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  try {
    const result = await submitFinanceQuery(parsed.data);
    return NextResponse.json({ success: true, trackingId: result.trackingId }, { status: 201 });
  } catch (error) {
    console.error("POST /api/finance/queries error:", error);
    return NextResponse.json({ success: false, error: "Could not submit financial query." }, { status: 500 });
  }
}
