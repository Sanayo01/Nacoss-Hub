import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sanitizedText } from "@/lib/input-validation";
import { submitSportsSignup } from "@/lib/remaining-offices";

const schema = z.object({
  name: sanitizedText(2, 100),
  sport: sanitizedText(2, 80),
  level: sanitizedText(2, 30),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid signup." }, { status: 400 });
  try {
    const result = await submitSportsSignup(parsed.data);
    return NextResponse.json({ success: true, data: { id: result.id } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/sports/signup error:", error);
    return NextResponse.json({ success: false, error: "Could not submit sports signup." }, { status: 500 });
  }
}
