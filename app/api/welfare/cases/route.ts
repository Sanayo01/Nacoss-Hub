import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { optionalSanitizedText, sanitizedText } from "@/lib/input-validation";
import { submitWelfareCase } from "@/lib/remaining-offices";

const schema = z.object({
  subject: sanitizedText(3, 160),
  message: sanitizedText(10, 5000),
  isAnonymous: z.boolean().default(false),
  senderName: optionalSanitizedText(100),
  senderEmail: z.string().trim().email().max(254).optional().nullable().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid case." }, { status: 400 });
  try {
    const result = await submitWelfareCase(parsed.data);
    return NextResponse.json({ success: true, trackingId: result.trackingId }, { status: 201 });
  } catch (error) {
    console.error("POST /api/welfare/cases error:", error);
    return NextResponse.json({ success: false, error: "Could not submit confidential welfare case." }, { status: 500 });
  }
}
